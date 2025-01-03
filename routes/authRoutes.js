const express = require('express');
const { signUp, signOut, verifyOTP,  sendOTPToResetPassword, verifyResetPasswordOTP, resetPassword } = require('../controllers/authController');
const validateSignup = require('../middlewares/validateSignup');
const AuthController = require("../controllers/authController");
const upload = require('../middlewares/multer');
const authenticateUser = require('../middlewares/authMiddleware');
const { getWalletDetails } = require('../controllers/walletController');



const router = express.Router();

router.post('/signup', validateSignup, signUp);
router.post('/verify-otp', verifyOTP);
router.post('/signin', AuthController.signIn);
router.post('/signout', AuthController.signOut);


router.post('/request-password-reset', sendOTPToResetPassword);
router.post('/verifyResetPasswordOTP', verifyResetPasswordOTP);
router.patch('/reset-password', resetPassword);

router.put('/upload-avatar', authenticateUser, upload.single('avatar'), AuthController.uploadAvatarController);

router.get('/wallet-details', authenticateUser, getWalletDetails);
 

module.exports = router;
 