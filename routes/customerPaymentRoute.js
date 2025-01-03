const express = require	('express');
const authenticateUser = require('../middlewares/authMiddleware');
const { customerToMerchantPayment } = require('../controllers/paymentContoller');

const router = express.Router();	

router.post('/customerPayment', authenticateUser, customerToMerchantPayment );

module.exports = router