const express = require	('express');
const authenticateUser = require('../middlewares/authMiddleware');
const { sendMoneyToMerchant, merchantReceivePayment } = require('../controllers/paymentContoller');

const router = express.Router();	


router.post('/customer-send-payment', authenticateUser, sendMoneyToMerchant );
router.post('/merchant-receive-payment', authenticateUser, merchantReceivePayment );


module.exports = router