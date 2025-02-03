const mongoose = require("mongoose");

const tagsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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

module.exports = mongoose.model("Tags", tagsSchema);
