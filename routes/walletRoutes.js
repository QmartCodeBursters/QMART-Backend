const express = require('express');

const { getWalletDetails, changeWalletPin, updateWalletBalance } = require('../controllers/walletController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/wallet-details', authenticateUser, getWalletDetails);
router.patch('/wallet-pin', authenticateUser, changeWalletPin);
router.patch('/update-balance', authenticateUser, updateWalletBalance);


module.exports = router;