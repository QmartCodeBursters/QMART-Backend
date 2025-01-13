const mongoose = require("mongoose")

const otpSchema = new mongoose.Schema(
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
      },
      otp: {
        type: String,
        required: true
      },
      otpType: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 
      }
    },
    { timestamps: true }
  );
  
  const Otp = mongoose.model('Otp', otpSchema);
  
  module.exports = Otp;
  