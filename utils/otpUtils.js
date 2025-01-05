const User = require("../models/userModel");
const { sendOtpEmail } = require("../services/emailService");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpVerification = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    console.log('Received email for OTP verification:', email); // Debugging email

    // Normalize the email to lowercase for consistency
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (otp === user.resetOtp && new Date() < new Date(user.otpExpiry)) {
      return next(); // Proceed to the next middleware or controller
    } else {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'An error occurred while verifying OTP.' });
  }
};


const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetOtp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "OTP resent successfully." });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Error resending OTP." });
  }
};

module.exports = { generateOtp, otpVerification, resendOtp };
