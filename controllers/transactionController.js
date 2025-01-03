const Transaction = require("../models/transactionModel");
const Wallet = require("../models/wallet");
const sendEmail = require("../services/emailService");
const generateReferenceId = require("../utils/generateTransactionId");

const handleTransaction = async (req, res) => {
  try {
    const { amount, type } = req.body;

   
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const wallet = await Wallet.findOne({ userId: req.user._id });

   
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    
    if (type === "withdrawal" && wallet.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

  
    const transaction = new Transaction({
      transactionId: generateReferenceId(),
      userId: req.user._id,
      walletId: wallet._id,
      type,
      amount,
      status: "pending", 
    });

    await transaction.save();

    setTimeout(async () => {
      try {
       
        if (type === "deposit") {
          wallet.balance += amount;
        } else if (type === "withdrawal") {
          wallet.balance -= amount;
        } else {
          transaction.status = "failed";
          await transaction.save();
          return;
        }

        await wallet.save();

      
        transaction.status = "completed";
        await transaction.save();

      
        sendEmail({
          to: req.user.email,
          subject: `${type.charAt(0).toUpperCase() + type.slice(1)} Successful`,
          text: `${type.charAt(0).toUpperCase() + type.slice(1)} of ${amount} was successful.`,
        });
      } catch (error) {
       
        transaction.status = "failed";
        await transaction.save();
        console.error("Error processing transaction:", error.message);
      }
    }, 5000);

    res.status(202).json({
      message: `Transaction is being processed`,
      transactionId: transaction.transactionId,
      status: transaction.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTransactionHistory = async (req, res) => {
  try {
    const filter = { userId: req.user._id };

    
    if (req.user.role === "merchant") {
      filter.type = "withdrawal";
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  handleTransaction,
  getTransactionHistory,
};
