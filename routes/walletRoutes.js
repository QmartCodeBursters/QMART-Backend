const express = require('express');

const { getWalletDetails } = require('../controllers/walletController');
const authenticateUser = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/wallet-details', authenticateUser, getWalletDetails)

module.exports = router;