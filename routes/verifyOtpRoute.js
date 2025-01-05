const express = require('express');
const AuthController = require('../controllers/authController');
const { otpVerification } = require('../utils/otpUtils');


const router = express.Router();

// Route to verify OTP
router.post('/verify-otp-code', otpVerification, AuthController.verifyOTP);

module.exports = router;
