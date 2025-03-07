const mongoose = require("mongoose");

const rewardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["STAKING", "TRADING", "OTHER"], // Add more types as needed
    },
    amount: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    wallet: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reward", rewardSchema);
