const User = require('../models/userModel');
const walletSettings = require('../models/walletSettings');
const { generateQRCode } = require('../utils/qRcodeGenerate');

exports.customerToMerchantPayment = async (req, res) => {
    const { amount, pin, cashAmount } = req.body; 

    try {
        // Validate required fields
        if (!amount || !pin) {
            return res.status(400).json({
                message: 'Please provide all required fields',
                error: true,
                success: false
            });
        }

        // Fetch the merchant details using the merchantAccountNumber from the QR code data
        const { merchantAccountNumber } = req.body; // Retrieve from request body

        const merchant = await User.findOne({ accountNumber: merchantAccountNumber, role: 'merchant' });

        if (!merchant) {
            return res.status(400).json({
                message: 'Merchant not found',
                error: true,
                success: false
            });
        }

        // Generate the QR code (add merchant details, business name, amount, and pin)
        const qrCodeData = await generateQRCode(
            merchantAccountNumber, 
            amount, 
            cashAmount, 
            pin, 
            merchant.businessName  // Business name from merchant user
        );

        // Respond with the QR code data and business name
        res.status(200).json({
            message: 'QR code generated successfully',
            qrCode: qrCodeData,
            merchant: {
                businessName: merchant.businessName, // Send only businessName to the client
                amount,  // Send the amount to be displayed on the front end
                cashAmount // Send the cashAmount to be displayed if applicable
            },
            error: false,
            success: true
        });

        // Handle if cashAmount is more than the total amount
        if (cashAmount && cashAmount > amount) {
            return res.status(400).json({
                message: 'Cash amount cannot exceed the total payment amount.',
                error: true,
                success: false
            });
        }

        const remainingAmount = amount - (cashAmount || 0);

        // Fetch customer and wallet details
        const customer = await User.findById(req.user._id);
        const customerWallet = await walletSettings.findOne({ userId: customer._id });

        if (!customerWallet) {
            return res.status(400).json({
                message: 'Wallet not found for customer',
                error: true,
                success: false
            });
        }

        if (customerWallet.pin !== pin) {
            return res.status(400).json({
                message: 'Incorrect wallet PIN',
                error: true,
                success: false
            });
        }

        // Check for insufficient wallet balance
        if (remainingAmount > customer.accountBalance) {
            const failedTransaction = new Transaction({
                from: customer._id,
                to: null, // No merchant details
                amount,
                status: 'failed'
            });

            await failedTransaction.save();
            return res.status(400).json({
                message: 'Insufficient Qmart Balance',
                error: true, 
                success: false
            }); 
        }

        if (cashAmount > customer.accountBalance) {
            return res.status(400).json({
                message: 'Insufficient funds for cash payment',
                error: true,
                success: false
            });
        }

        // Proceed with the transaction
        const transaction = new Transaction({
            from: customer._id,
            to: merchant._id,
            amount,
            status: 'pending'
        });

        await transaction.save();

        // Deduct amounts from customer’s balance
        if (cashAmount > 0) {
            customer.accountBalance -= cashAmount;
        }

        if (remainingAmount > 0) {
            customer.accountBalance -= remainingAmount;
        }

        // Credit merchant’s account balance
        merchant.accountBalance += amount;

        await customer.save();
        await merchant.save();

        // Update transaction status to success
        transaction.status = 'success';
        await transaction.save();

        res.status(200).json({
            message: 'Payment successful',
            transaction,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error processing payment', error);

        const failedTransaction = new Transaction({
            from: req.user._id,
            to: null,
            amount: req.body.amount || 0,
            status: 'failed'
        });

        await failedTransaction.save();

        res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
};
