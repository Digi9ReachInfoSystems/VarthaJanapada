const mongoose = require("mongoose");

const magazine2VersionSchema = new mongoose.Schema({
  magazineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Magazine2",
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

module.exports = mongoose.model("Magazine2Version", magazine2VersionSchema);
