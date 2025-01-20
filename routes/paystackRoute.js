const express = require('express');
const { initializePayment, verifyPayment } = require('../controllers/paystackController');

const router = express.Router();

router.post('/initialize', initializePayment);
router.get('/verify', verifyPayment);

module.exports = router;
