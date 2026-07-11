const mongoose = require("mongoose");

const photoCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  category_name: {
    type: String,
  },
  english: {
    type: String,
  },
  hindi: {
    type: String,
  },
  kannada: {
    type: String,
  },
  description: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_updated: {
    type: Date,
  },
});

module.exports = mongoose.model("PhotoCategory", photoCategorySchema);
