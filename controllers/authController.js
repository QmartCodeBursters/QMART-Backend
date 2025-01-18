const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { sendOtpEmail, sendEmail } = require("../services/emailService");
const { generateAccountNumber } = require("../utils/accountNumberGenerator");
const { generateOtp } = require("../utils/otpUtils");
const uploadImageCloudinary = require("../utils/cloudinary");
const Otp = require("../models/otpModel");
const Cookies = require("cookies");

const AuthController = {};

const generateUniqueAccountNumber = async () => {
  let accountNumber;
  let userExists;

  do {
    accountNumber = await generateAccountNumber();
    userExists = await User.findOne({ accountNumber });
  } while (userExists);

  return accountNumber.toString();
};

AuthController.signUp = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNumber, address, role } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !address ||
      !phoneNumber ||
      !role
    ) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountNumber = await generateUniqueAccountNumber();

    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      address,
      password: hashedPassword,
      accountNumber,
      role,
    });

    await newUser.save();
    console.log("User saved successfully:", newUser._id);

    const otp = generateOtp();
    console.log("Generated OTP:", otp);

    const otpDocument = new Otp({
      user: newUser._id,
      otp,
      otpType: "emailVerification",
    });

    await otpDocument.save();
    console.log("OTP document saved successfully:", otpDocument);

    await sendOtpEmail(newUser.email, otp);
    console.log("OTP email sent to:", newUser.email);

    res.status(200).json({
      message: "OTP sent to your email. Verify to complete registration.",
      data: { email },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Signup failed.", error: error.message });
  }
};

AuthController.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "OTP and email are required.",
        error: true,
        success: false,
      });
    }

    console.log("Verifying OTP for email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        error: true,
        success: false,
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    const otpDocument = await Otp.findOne({
      user: user._id,
      otp,
      otpType: "emailVerification",
    });
    if (!otpDocument) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (new Date() > otpDocument.expiresAt) {
      return res.status(400).json({ message: "OTP has expired." });
    }
    user.isVerified = true;
    await user.save();

    await Otp.deleteOne({ _id: otpDocument._id });

    console.log("OTP verified successfully for email:", email);
    res
      .status(200)
      .json({ message: "Email verified successfully.", success: true });
  } catch (error) {
    console.error("OTP verification failed:", error.message);
    res.status(500).json({
      message: "OTP verification failed.",
      error: error.message,
      success: false,
    });
  }
};

AuthController.fetchUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("business");
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has a business and adjust accordingly
    const businessName = user.business ? user.business.businessName : null;

    res.status(200).json({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      address: user.address,
      password: user.hashedPassword,
      phoneNumber: user.phoneNumber,
      role: user.role,
      businessName: businessName,  // Only include businessName if it exists
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user details", error: error.message });
  }
};


AuthController.signIn = async (req, res) => {
  console.log("received");

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    console.log("Finding user with email:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found with email:", email);
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    console.log("User found:", user);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      console.log("Incorrect password for user:", email);
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password." });
    }

    console.log("Password match for user:", email);

    const token = jwt.sign(
      { _id: user._id, accountNumber: user.accountNumber },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    console.log("Generated JWT token for user:", email);

    const cookies = new Cookies(req, res);
    cookies.set("jwt", token, {
      httpOnly: true, // Ensure cookie can't be accessed via JavaScript
      secure: process.env.NODE_ENV === "production", // Use 'secure: true' in production
      sameSite: "Strict", // Controls cookie sending with cross-site requests
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Set cookie expiry
    });

    console.log("JWT token set in cookie for user:", email);

    const {
      password: _,
      resetOtp: __,
      otpExpiry: ___,
      ...userData
    } = user._doc;

    res.status(200).json({
      success: true,
      message: "Sign-in successful.",
      data: { token, user: userData },
    });
  } catch (error) {
    console.error("Sign-in Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Sign-in failed.",
      error: error.message,
    });
  }
};
AuthController.sendOTPToResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.otpExpiry = otpExpiresAt;
    await user.save();

    await sendOtpEmail(email, otp);

    res
      .status(200)
      .json({ message: "OTP sent to your email for password reset." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to send OTP.", error: error.message });
  }
};

AuthController.verifyResetPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.resetOtp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    res
      .status(200)
      .json({ message: "OTP verified. You can now reset your password." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to verify OTP.", error: error.message });
  }
};

AuthController.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.otpExpiry = null;
    await user.save();

    res
      .status(200)
      .json({ message: "Password reset successful. You can now sign in." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to reset password.", error: error.message });
  }
};

AuthController.uploadAvatarController = async (req, res) => {
  try {
    const user = req.user; // Access the entire user object
    const image = req.file; // from multer middleware

    console.log("User received:", user); // Debug log to verify user
    console.log("Image received:", image);

    if (!image) {
      return res.status(400).json({
        message: "No file uploaded",
        error: true,
        success: false,
      });
    }

    const upload = await uploadImageCloudinary(image);

    console.log("Upload result from Cloudinary:", upload);

    if (!upload || !upload.url) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    // Ensure user is valid before updating the database
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not authenticated", error: true });
    }

    const updateUser = await User.findByIdAndUpdate(
      user._id, // Use user._id instead of userId
      { avatar: upload.url },
      { new: true }
    );

    if (!updateUser) {
      throw new Error("User not found or update failed");
    }

    return res.json({
      message: "Upload successful",
      data: {
        _id: user._id,
        avatar: upload.url,
      },
      error: false,
      success: true,
    });
  } catch (error) {
    console.error("Error in uploadAvatarController:", error);
    return res.status(500).json({
      message: error.message || error,
      error: true,
      success: false,
    });
  }
};

AuthController.signOut = async (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true, // Use true if using HTTPS
      sameSite: "strict",
    });

    // Log the sign-out activity
    console.log(`User signed out at ${new Date().toISOString()}`);

    // Send a success response
    res.status(200).json({
      message: "Sign-out successful.",
      success: true,
    });
  } catch (error) {
    console.error("Sign-out Error:", error.message);

    // Send an error response
    res.status(500).json({
      message: "Sign-out failed.",
      success: false,
      error: error.message,
    });
  }
};

module.exports = AuthController;
