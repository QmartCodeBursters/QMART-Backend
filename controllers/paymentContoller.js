// const uuidv4 = require('uuid').v4;
// const bcrypt = require('bcrypt');
// const User = require('../models/userModel'); 
// const walletSettings = require('../models/walletSettings'); 

// exports.sendMoneyToMerchant = async (req, res, io) => {
//   console.log("sendMoneyToMerchant route hit");

//   const { walletNumber, amount, pin } = req.body;

//   try {
//     const transactionId = uuidv4(); // Generate a unique transaction ID
//     console.log("Generated Transaction ID:", transactionId);

//     let wallet = await walletSettings.findOne({ userId: req.user._id });

//     if (!wallet) {
//       const hashedPin = await bcrypt.hash('1234', 10);
//       wallet = new walletSettings({
//         userId: req.user._id,
//         pin: hashedPin,
//       });
//       await wallet.save();
//     } else {
//       if (!wallet.pin || wallet.pin.length !== 60) {
//         const hashedPin = await bcrypt.hash(wallet.pin, 10);
//         wallet.pin = hashedPin;
//         await wallet.save();
//       }
//     }

//     const isPinCorrect = await bcrypt.compare(pin, wallet.pin);
//     if (!isPinCorrect) {
//       return res.status(400).json({
//         message: 'Incorrect PIN.',
//         error: true,
//         success: false,
//         transactionId,
//       });
//     }

//     const customer = await User.findById(req.user._id);
//     const merchant = await User.findOne({ accountNumber: walletNumber });

//     if (!merchant) {
//       return res.status(404).json({
//         message: 'Merchant not found.',
//         error: true,
//         success: false,
//         transactionId,
//       });
//     }

//     const transactionFee = amount * 0.05;
//     const totalDeduction = amount + transactionFee;

//     if (customer.accountBalance < totalDeduction) {
//       return res.status(400).json({
//         message: 'Insufficient balance to cover the amount and transaction fee.',
//         error: true,
//         success: false,
//         transactionId,
//       });
//     }

//     // Deduct the total amount from the customer's balance
//     customer.accountBalance -= totalDeduction;

//     // Add the sent amount and the transaction fee to the merchant's balance
//     merchant.accountBalance += (amount + transactionFee);

//     // Save changes to both customer and merchant
//     await customer.save();
//     await merchant.save();

//     // Emit notifications to customer and merchant
//     io.emit('transaction', {
//       message: `Transaction successful: You have been debited with ${amount} NGN.`,
//       type: 'debit',
//       name: customer.name,
//       walletNumber: customer.walletNumber,
//       amount,
//       balance: customer.accountBalance,
//       transactionId,
//     });

//     io.emit('transaction', {
//       message: `Transaction successful: You have been credited with ${amount} NGN.`,
//       type: 'credit',
//       name: merchant.name,
//       walletNumber: merchant.walletNumber,
//       amount,
//       balance: merchant.accountBalance,
//       transactionId,
//     });

//     res.status(200).json({
//       message: 'Payment successful.',
//       success: true,
//       transactionId,
//       transactionFee,
//     });
//   } catch (error) {
//     console.error('Error processing payment:', error);
//     res.status(500).json({
//       message: 'Server error.',
//       error: error.message,
//       success: false,
//       transactionId: uuidv4(),
//     });
//   }
// };

// // Function to handle payment reception by the merchant
// exports.merchantReceivePayment = async (req, res) => {
//   const { amount } = req.body;

//   try {
//     const paymentId = uuidv4(); // Generate a unique payment ID
//     console.log("Generated Payment ID:", paymentId);

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         message: 'Invalid amount. Please enter a valid amount.',
//         error: true,
//         success: false,
//         paymentId,
//       });
//     }

//     const user = await User.findById(req.user._id);
//     if (!user || user.role !== 'merchant') {
//       return res.status(403).json({
//         message: 'User is not a merchant.',
//         error: true,
//         success: false,
//         paymentId,
//       });
//     }

//     user.accountBalance += amount;

//     await user.save();

//     res.status(200).json({
//       message: 'Payment received successfully.',
//       success: true,
//       paymentId, // Include paymentId in the response
//     });
//   } catch (error) {
//     console.error('Error processing payment reception:', error);
//     res.status(500).json({
//       message: 'Server error.',
//       error: error.message,
//       success: false,
//       paymentId: uuidv4(), // Include a new paymentId for server error logging
//     });
//   }
// };
// exports.depositMoney = async (req, res) => {
//   const { amount } = req.body;

//   try {
//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         message: 'Invalid amount. Please enter a valid deposit amount.',
//         success: false,
//       });
//     }

//     // Fetch the user's account
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({
//         message: 'User not found.',
//         success: false,
//       });
//     }

//     // Update the user's account balance
//     user.accountBalance += amount;
//     await user.save();

//     // Create a transaction record
//     const transaction = new Transaction({
//       transactionId: uuidv4(),
//       userId: req.user._id,
//       amount,
//       type: 'credit',
//       status: 'completed',
//     });

//     await transaction.save();

//     res.status(200).json({
//       message: 'Deposit successful.',
//       success: true,
//       transaction,
//     });
//   } catch (error) {
//     console.error('Error processing deposit:', error);
//     res.status(500).json({
//       message: 'Server error.',
//       error: error.message,
//       success: false,
//     });
//   }
// };
// exports.withdrawMoney = async (req, res) => {
//   const { amount } = req.body;

//   try {
//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         message: 'Invalid amount. Please enter a valid withdrawal amount.',
//         success: false,
//       });
//     }

//     // Fetch the user's account
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).json({
//         message: 'User not found.',
//         success: false,
//       });
//     }

//     // Check if the user has sufficient balance
//     if (user.accountBalance < amount) {
//       return res.status(400).json({
//         message: 'Insufficient balance.',
//         success: false,
//       });
//     }

//     // Update the user's account balance
//     user.accountBalance -= amount;
//     await user.save();

//     // Create a transaction record
//     const transaction = new Transaction({
//       transactionId: uuidv4(),
//       userId: req.user._id,
//       amount,
//       type: 'debit',
//       status: 'completed',
//     });

//     await transaction.save();

//     res.status(200).json({
//       message: 'Withdrawal successful.',
//       success: true,
//       transaction,
//     });
//   } catch (error) {
//     console.error('Error processing withdrawal:', error);
//     res.status(500).json({
//       message: 'Server error.',
//       error: error.message,
//       success: false,
//     });
//   }
// };



