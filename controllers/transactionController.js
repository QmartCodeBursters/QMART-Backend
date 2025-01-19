const Transaction = require("../models/transactionModel");
const Wallet = require("../models/wallet");
const sendEmail = require("../services/emailService");
const generateReferenceId = require("../utils/generateTransactionId");

const handleTransaction = async (req, res) => {
  try {
    const { amount, type } = req.body;

    // Validate the amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Find the wallet
    const wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    // Handle withdrawal if not enough balance
    if (type === "withdrawal" && wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Create a new transaction
    const transaction = new Transaction({
      transactionId: generateReferenceId(),
      senderId: req.user._id,
      receiverId: merchantId,  // Assuming wallet has userId, adjust accordingly
      amount: amount,
      type: "credit", // Adjust based on your needs
      fee: transactionFee,  // Adjust fee as needed
      totalDeduction: amount + transactionFee,  // Adjust with the fee
      status: "pending",
    });

    // Log the transaction object before saving it
    console.log("Transaction object before saving:", transaction);

    // Save the transaction
    try {
      await transaction.save();
    } catch (error) {
      console.error("Error saving transaction:", error.message);
      return res.status(500).json({ message: "Failed to save transaction" });
    }

    // Process the transaction after a delay
    setTimeout(async () => {
      try {
        // Update wallet balance
        if (type === "deposit") {
          wallet.balance += amount;
        } else if (type === "withdrawal") {
          wallet.balance -= amount;
        } else {
          throw new Error("Invalid transaction type");
        }

        // Save the wallet
        await wallet.save();

        // Update transaction status to 'completed'
        transaction.status = "completed";
        await transaction.save();
      } catch (error) {
        console.error("Error processing transaction:", error.message);
        transaction.status = "failed";
        await transaction.save();
      }
    }, 5000);

    // Respond to the client
    res.status(202).json({
      message: `Transaction is being processed`,
      transactionId: transaction.transactionId,
      status: transaction.status,
    });
  } catch (error) {
    console.error("General error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;

    let filter = { userId: req.user._id };

    if (req.user.role === "merchant") {
      filter.type = "withdrawal";
    }

    if (transactionType) {
      filter.amountType = transactionType;
    }

    if (startDate || endDate) {
      if (startDate) {
        filter.createdAt = { $gte: new Date(startDate) };
      }
      if (endDate) {
        if (!filter.createdAt) {
          filter.createdAt = {};
        }
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Find a specific transaction by ID (for testing purposes)
    const transaction = await Transaction.findOne({ transactionId: "9729cf10-819c-4a2f-80c8-ecaed0b1b8d1" });
    console.log("Transaction found:", transaction);

    // Fetch all transactions based on the filter
    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


module.exports = {
  handleTransaction,
  getTransactionHistory,
};
