const mongoose = require("mongoose");
const crypto = require("crypto");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true, 
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true, 
        },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, 
        },
    type: {
      type: String,
      enum: ["deposit", "withdrawal"], 
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "merchant"],
      required: true,
    },
    amount: {
      type: Number,
      required: true, 
      min: [0, "Amount must be positive"], 
    },
    amountType: {
      type: String,
      enum: ["debit", "credit"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"], 
      default: "pending", 
    },
    notificationSent: {
      type: Boolean,
      default: false, 
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
    transactionHistory: {
      type: [
        {
          type: String,
          enum: ["deposit", "withdrawal"], 
        },
      ],
      default: [], 
    },
  },
  {
    timestamps: true, 
  }
);

// Pre-save hook to generate a referenceId if not provided
transactionSchema.pre("save", function (next) {
  if (!this.referenceId) {
    this.referenceId = crypto.randomBytes(8).toString("hex").toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
