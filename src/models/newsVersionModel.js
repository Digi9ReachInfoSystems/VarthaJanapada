// models/newsVersionModel.js
const mongoose = require("mongoose");

const newsVersionSchema = new mongoose.Schema({
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "News",
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
  versionNumber: {
    type: Number,
    required: true,
  },
  snapshot: {
    type: Object, // Stores the full news snapshot
    required: true,
  },
});

module.exports = mongoose.model("NewsVersion", newsVersionSchema);
