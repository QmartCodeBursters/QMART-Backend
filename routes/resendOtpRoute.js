const express = require('express');
const { resendOtp } = require('../utils/otpUtils');
const router = express.Router();


// Route to resend OTP
router.post('/resend-otp', resendOtp);

module.exports = router;
