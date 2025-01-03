const crypto = require('crypto');
const User = require('../models/userModel');
const { sendOtpEmail } = require('../services/emailService');

const generateOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    // Check if the user exists in the database
    let user = await User.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one with the OTP and expiry time
      const otp = crypto.randomInt(100000, 999999); // Generate 6-digit OTP
      const otpExpiresAt = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

      user = new User({
        email,
        otp,
        otpExpiresAt,
      });

      await user.save();
    } else {
      // If user exists, update their OTP and expiration time
      const otp = crypto.randomInt(100000, 999999);
      const otpExpiresAt = Date.now() + 10 * 60 * 1000;

      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;

      await user.save();
    }

    const emailSent = await sendOtpEmail(email, user.otp);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }

    next();
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  generateOtp,
};
