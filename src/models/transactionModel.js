const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  mobileNumber: {
    type: String,
    required: true
  },

  provider: {
    type: String,
    required: true
  },

  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plan",
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["UPI", "CARD", "NETBANKING"],
    required: true
  },

  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED"],
    default: "PENDING"
  },

  transactionId: {
    type: String,
    unique: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
