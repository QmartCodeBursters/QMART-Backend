const walletSettings = require('../models/walletSettings');
const User = require('../models/userModel');
const Wallet = require('../models/walletModel');
const QRCode = require('qrcode');


exports.sendMoneyToMerchant = async (req, res) => {
  const { walletNumber, amount, pin } = req.body;

  try {
    // Fetch the user's wallet settings
    const wallet = await walletSettings.findOne({ userId: req.user._id });
    if (!wallet) {
      return res.status(400).json({
        message: 'Wallet settings not found.',
        error: true,
        success: false,
      });
    }

    // Verify the PIN
    if (wallet.pin !== pin) {
      return res.status(400).json({
        message: 'Incorrect PIN.',
        error: true,
        success: false,
      });
    }

    // Fetch the customer and merchant users
    const customer = await User.findById(req.user._id);
    const merchant = await User.findOne({ accountNumber: walletNumber });

    if (!merchant) {
      return res.status(404).json({
        message: 'Merchant not found.',
        error: true,
        success: false,
      });
    }

    // Check if the customer has enough balance
    if (customer.accountBalance < amount) {
      return res.status(400).json({
        message: 'Insufficient balance.',
        error: true,
        success: false,
      });
    }

    // Deduct the amount from the customer's balance and add it to the merchant's balance
    customer.accountBalance -= amount;
    merchant.accountBalance += amount;

    // Save the updated balances
    await customer.save();
    await merchant.save();

    res.status(200).json({
      message: 'Payment successful.',
      success: true,
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({
      message: 'Server error.',
      error: error.message,
      success: false,
    });
  }
};




exports.merchantReceivePayment = async (req, res) => {
  const { amount } = req.body;

  try {
    // Validate the input amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid amount. Please enter a valid amount.',
        error: true,
        success: false,
      });
    }

    // Fetch the merchant's details
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'merchant') {
      return res.status(403).json({
        message: 'Only merchants can generate QR codes.',
        error: true,
        success: false,
      });
    }

    // Generate the QR code data
    const qrData = {
      businessName: user.businessName,
      walletNumber: user.accountNumber,
      amount: amount,
    };

    // Generate the QR code
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    res.status(200).json({
      message: 'QR Code generated successfully.',
      qrCodeUrl: qrCodeUrl,
      success: true,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      message: 'Server error.',
      error: error.message,
      success: false,
    });
  }
};

