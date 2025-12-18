const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    lowercase: true, // airtel, jio, vi
    index: true
  },

  planName: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  data: {
    type: String,
    required: true 
  },

  validity: {
    type: String,
    required: true
  },

  addOns: {
    type: String 
  }

}, { timestamps: true });


module.exports = mongoose.model("Plan", planSchema);