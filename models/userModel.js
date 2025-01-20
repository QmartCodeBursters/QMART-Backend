const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  role: { 
    type: String, 
    enum: ['merchant', 'customer'], 
    required: true 
  },
  tier: { 
    type: Number, 
    default: 1 
  },
  accountBalance: { 
    type: Number, 
    default: 0 
  },
  accountNumber: { 
    type: String, 
    unique: true 
  },
  otp: { 
    type: String 
  },
  otpExpiresAt: { 
    type: Date 
  },
  resetOtp: { 
    type: String 
  },
  otpExpiry: { 
    type: Date, 
    select: false 
  },
  otpVerified: { 
    type: Boolean, 
    default: false 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, default: Date.now 
  },
  wallet: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Wallet' 
  }, 
  business: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Business' 
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
