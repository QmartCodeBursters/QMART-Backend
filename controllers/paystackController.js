const paystack = require('../utils/paystack');
const axios = require('axios');
const Transaction = require("../models/transactionModel");
const User = require('../models/userModel');

// Initialize a transaction
exports.initializePayment = async (req, res) => {
    const { email, amount } = req.body;
  
    if (!email || !amount) {
      return res.status(400).json({ message: 'Email and amount are required' });
    }
  
    try {
      const amountInKobo = amount * 100; // Convert to Kobo (1 Naira = 100 Kobo)
  
      // Initialize Paystack transaction
      const response = await paystack.transaction.initialize({
        email,
        amount: amountInKobo,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      });
  
      res.status(200).json({
        message: 'Payment initialized successfully',
        authorization_url: response.data.authorization_url,
        reference: response.data.reference,
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

// Verify payment
exports.verifyPayment = async (req, res) => {
  const { reference } = req.query; // Get the reference from the callback

  if (!reference) {
    return res.status(400).json({ message: 'Reference is required' });
  }

  try {
    // Verify the payment with Paystack
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const transactionData = response.data.data;

    if (transactionData.status === 'success') {
      // Payment was successful
      const amountInNaira = transactionData.amount / 100; // Convert from Kobo to Naira
      const transactionFee = transactionData.fees / 100; // Convert fee from Kobo to Naira
      const amountToMerchant = amountInNaira - transactionFee; // Merchant receives amount minus the fee

      // Find the customer using the email (you might want to customize this logic)
      const customer = await User.findOne({ email: transactionData.customer.email });
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Find the merchant using the email (or another way like merchant id)
      const merchant = await User.findOne({ email: transactionData.email, role: 'merchant' });
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }

      // Step 1: Deduct the total amount (payment + fee) from the customer's account balance
      const totalDeduction = amountInNaira + transactionFee;
      if (customer.accountBalance < totalDeduction) {
        return res.status(400).json({ message: 'Insufficient balance in customer account' });
      }

      customer.accountBalance -= totalDeduction;
      await customer.save();

      // Step 2: Add the payment amount (minus fees) to the merchant's account balance
      merchant.accountBalance += amountToMerchant;
      await merchant.save();

      // Step 3: Create a transaction record for audit purposes
      const transaction = new Transaction({
        transactionId: transactionData.id,
        amount: amountInNaira,
        transactionFee,
        customerId: customer._id,
        merchantId: merchant._id,
        status: 'completed',
        reference: transactionData.reference,
        type: 'payment', // or 'transfer' depending on your logic
      });

      await transaction.save();

      // Step 4: Notify customer and merchant if needed (you can use emails or other methods here)

      res.status(200).json({
        message: 'Payment verified, customer and merchant balances updated',
        success: true,
      });
    } else {
      // Payment failed
      res.status(400).json({
        message: 'Payment verification failed',
        success: false,
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      success: false,
    });
  }
};

  