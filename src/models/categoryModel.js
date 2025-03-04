const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  hindi: {
    type: String,
  },
  kannada: {
    type: String,
  },
  English: {
    type: String,
  },
  description: {
    type: String,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_updated: {
    type: Date,
  },
});

module.exports = mongoose.model("Category", categorySchema);
