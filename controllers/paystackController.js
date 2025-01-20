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
exports.verifyPayment = async (req, res) => {
    const { reference } = req.query;
  
    if (!reference) {
      return res.status(400).json({ message: 'Reference is required' });
    }
  
    try {
      // Make API call to Paystack to verify the payment
      const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      });
  
      const transactionData = response.data.data;
  
      if (transactionData.status === 'success') {
        // Find the transaction by reference
        const transaction = await Transaction.findOne({ reference });
  
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
  
        // Ensure that the transaction has not been processed already
        if (transaction.status === 'completed') {
          return res.status(400).json({ message: 'Transaction has already been processed' });
        }
  
        const amountInNaira = transactionData.amount / 100; // Convert from Kobo to Naira
        const transactionFee = amountInNaira * 0.005; // 0.5% fee
        const amountToMerchant = amountInNaira - transactionFee; // Amount to the merchant after deducting fee
        const totalDeduction = amountInNaira + transactionFee; // Total amount deducted from the customer
  
        // Find the customer and merchant
        const customer = await User.findOne({ email: transaction.customerEmail });
        const merchant = await User.findById(transaction.merchantId);
  
        if (!customer || !merchant) {
          return res.status(404).json({ message: 'Customer or Merchant not found' });
        }
  
        // Ensure the customer has enough balance
        if (customer.accountBalance < totalDeduction) {
          return res.status(400).json({ message: 'Insufficient balance in customer account' });
        }
  
        // Step 1: Deduct the total amount from the customer's balance
        customer.accountBalance -= totalDeduction;
        await customer.save();
  
        // Step 2: Add the amount to the merchant's balance
        merchant.accountBalance += amountToMerchant;
        await merchant.save();
  
        // Step 3: Update the transaction with the necessary details
        transaction.status = 'completed'; // Mark as completed
        transaction.transactionFee = transactionFee;
        transaction.amount = amountInNaira;
        transaction.totalDeduction = totalDeduction;
        transaction.receiverId = merchant._id; // Set the merchant as receiver
        transaction.senderId = customer._id; // Set the customer as sender
        transaction.transactionId = transactionData.id; // Update with Paystack's transaction ID
        await transaction.save();
  
        // Respond with success
        res.status(200).json({
          message: 'Payment verified and merchant credited',
          success: true,
        });
      } else {
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

