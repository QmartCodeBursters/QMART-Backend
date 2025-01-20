const express = require('express');
const authenticateUser = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentContoller');

const router = express.Router();

// Function to initialize routes with Socket.IO
module.exports = (io) => {
  router.post('/customer-send-payment', authenticateUser, (req, res) =>
    paymentController.sendMoneyToMerchant(req, res, io)
  );
  router.post('/merchant-receive-payment', authenticateUser, (req, res) =>
    paymentController.merchantReceivePayment(req, res, io)
  );
  return router;
};
