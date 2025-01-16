const express = require('express');
const { sendOTPToResetPassword, verifyResetPasswordOTP, resetPassword } = require('../controllers/authController');
const AuthController = require("../controllers/authController");
const upload = require('../middlewares/multer');
const authenticateUser = require('../middlewares/authMiddleware');
const { getWalletDetails } = require('../controllers/walletController');
const { otpVerification, resendOtp } = require('../utils/otpUtils');

const router = express.Router();

router.post('/signup', AuthController.signUp);
router.post('/signin', AuthController.signIn);
router.post('/verify-otp-code', AuthController.verifyOTP);
router.post('/signout', AuthController.signOut);
router.get('/me', authenticateUser,  AuthController.fetchUser);
router.post('/verify-otp', otpVerification);
router.post('/send-otp', resendOtp);
router.post('/request-password-reset', sendOTPToResetPassword);
router.post('/verifyResetPasswordOTP', verifyResetPasswordOTP);
router.patch('/reset-password', resetPassword);
router.put('/upload-avatar', authenticateUser, upload.single('avatar'), AuthController.uploadAvatarController);
router.get('/wallet-details', authenticateUser, getWalletDetails);
 

module.exports = router;
 