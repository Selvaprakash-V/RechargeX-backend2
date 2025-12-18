const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  name: {
    type: String,
    required: true
  },

  profilePhoto: {
    type: String,
    default: ""
  },

  feedback: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
