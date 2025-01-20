const paystack = require('../utils/paystack');
const axios = require('axios');
const Transaction = require("../models/transactionModel");
const User = require('../models/userModel');

// Initialize a transaction
exports.initializePayment = async (req, res) => {
    const { email, amount, merchantEmail } = req.body;
  
    if (!email || !amount || !merchantEmail) {
      return res.status(400).json({ message: 'Email, amount, and merchantEmail are required' });
    }
  
    try {
      const amountInKobo = amount * 100; // Convert to Kobo
  
      // Verify that the merchant exists
      const merchant = await User.findOne({ email: merchantEmail, role: 'merchant' });
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }
  
      // Initialize Paystack transaction
      const response = await paystack.transaction.initialize({
        email,
        amount: amountInKobo,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      });
      
      console.log('Paystack Response:', response); // Log the full response
      
      if (response.status !== 'success') {
        return res.status(400).json({ message: 'Failed to initialize payment', error: response });
      }
      
  
      if (response.status !== 'success') {
        return res.status(400).json({ message: 'Failed to initialize payment' });
      }
  
      const transactionId = response.data.id; // Ensure that the transactionId is retrieved from Paystack
  
      // Check if the transactionId is valid
      if (!transactionId) {
        return res.status(400).json({ message: 'Transaction ID is missing from Paystack response' });
      }
  
      // Create a pending transaction in the database with only the necessary fields
      const transaction = new Transaction({
        amount,
        reference: response.data.reference,
        merchantId: merchant._id,
        customerEmail: email,
        status: 'pending',
        type: 'payment', // Type of transaction
        totalDeduction: 0, // Initial value, will be updated later
        fee: 0, // Initial fee, will be updated later
        transactionId, // Set the transactionId here
      });
  
      await transaction.save();
  
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
 exports.verifyPayment = async (reference) => {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`);
      const contentType = response.headers.get('content-type');
    
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (data.success) {
          console.log('Payment verified and merchant credited');
          // Redirect to success page
          setTimeout(() => {
            window.location.href = "/transaction-status-success";
          }, 1000); // Optional delay to ensure the user sees the result
        } else {
          console.log('Payment verification failed');
          // Redirect to failure page
          setTimeout(() => {
            window.location.href = "/transaction-status-failure";
          }, 1000);
        }
      } else {
        console.error('Received non-JSON response:', await response.text());
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      // Optionally show an error page or message to the user
      window.location.href = "/payment/failure";
    }
  };
  
  
  
exports.getMerchantTransactions = async (req, res) => {
const { merchantId } = req.query;

if (!merchantId) {
    return res.status(400).json({ message: 'Merchant ID is required' });
}

try {
    const transactions = await Transaction.find({ merchantId }).sort({ createdAt: -1 });

    if (!transactions || transactions.length === 0) {
    return res.status(404).json({ message: 'No transactions found for this merchant' });
    }

    res.status(200).json({
    message: 'Transactions retrieved successfully',
    success: true,
    transactions,
    }); 

} catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
    message: 'Server error',
    error: error.message,
    success: false,
    });
}
};

