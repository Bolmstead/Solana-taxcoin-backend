const mongoose = require("mongoose");

const snapshotSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    holdings: {
      type: Map,
      of: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Snapshot", snapshotSchema);
