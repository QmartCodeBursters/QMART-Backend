
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { sendOtpEmail, sendEmail } = require("../services/emailService");
const { generateAccountNumber } = require("../utils/accountNumberGenerator");
const {generateOtp} = require("../utils/otpUtils");
const uploadImageCloudinary = require("../utils/cloudinary");



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
    const { firstName, lastName, email, password, accountBalance = 0, phoneNumber, role } = req.body;

    if (!firstName || !lastName || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountNumber = await generateUniqueAccountNumber();

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    const newUser = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      accountNumber,
      accountBalance,
      resetOtp: otp,
      otpExpiry: otpExpiresAt,
      role,
    });

    await newUser.save();
    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: 'OTP sent to your email. Verify to complete registration.',
      data: { email },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Signup failed.', error: error.message });
  }
};


AuthController.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }

    if (user.resetOtp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.resetOtp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed.', error: error.message });
  }
};


AuthController.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = jwt.sign(
      { _id: user._id, accountNumber: user.accountNumber },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      sameSite: 'strict',
    });

    const { password: _, resetOtp: __, otpExpiry: ___, ...userData } = user._doc;

    res.status(200).json({
      message: 'Sign-in successful.',
      data: { token, user: userData },
    });
  } catch (error) {
    res.status(500).json({ message: 'Sign-in failed.', error: error.message });
  }
};

AuthController.sendOTPToResetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.otpExpiry = otpExpiresAt;
    await user.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to your email for password reset.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
};


AuthController.verifyResetPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.resetOtp !== otp || new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    res.status(200).json({ message: 'OTP verified. You can now reset your password.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify OTP.', error: error.message });
  }
};

// Reset Password
AuthController.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password.', error: error.message });
  }
};

//upload user avatar
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
          return res.status(400).json({ message: "User not authenticated", error: true });
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
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: true, // Use true if using HTTPS
      sameSite: 'strict',
    });

    // Log the sign-out activity
    console.log(`User signed out at ${new Date().toISOString()}`);

    // Send a success response
    res.status(200).json({
      message: 'Sign-out successful.',
      success: true,
    });
  } catch (error) {
    console.error('Sign-out Error:', error.message);

    // Send an error response
    res.status(500).json({
      message: 'Sign-out failed.',
      success: false,
      error: error.message,
    });
  }
};


module.exports = AuthController;
