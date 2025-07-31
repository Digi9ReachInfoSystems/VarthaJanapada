const mongoose = require("mongoose");

const longVideoVersionSchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LongVideo",
    required: true,
  },
  versionNumber: {
    type: Number,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  snapshot: {
    type: Object,
    required: true,
  },
});

module.exports = mongoose.model("LongVideoVersion", longVideoVersionSchema);
