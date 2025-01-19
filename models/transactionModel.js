const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    unique: true,
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  receiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['debit', 'credit'], 
    required: true 
  },
  fee: { 
    type: Number, 
    required: true 
  },
  totalDeduction: { 
    type: Number, 
    required: true 
  },
  status: {  
    type: String, 
    enum: ['completed', 'pending', 'failed'], 
    default: 'completed' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
