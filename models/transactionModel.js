const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String,  },
  amount: { type: Number, required: true },
  fee: { type: Number, required: true },
  type: { type: String, required: true }, // e.g., "payment"
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
  totalDeduction: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['completed', 'failed', 'pending'], // Include 'pending' for initialization
    required: true,
    default: 'pending' // Default status when a transaction is initialized
  },
  reference: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
