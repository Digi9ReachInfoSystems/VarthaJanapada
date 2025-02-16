const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A notification must have a title"],
  },
  description: {
    type: String,
    required: [true, "A notification must have a description"],
  },
  createdTime: {
    type: Date,
    default: Date.now(),
  },
  last_updated: {
    type: Date,
  },
  fcm_token: {
    type: String,
    required: [true, "A notification must have a fcm token"],
  },
  type: {
    type: String,
    required: [true, "A notification must have a type"],
  },
  read: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Notification", notificationSchema);
