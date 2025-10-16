const mongoose = require("mongoose");
const latestNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
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
  link: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model("LatestNotification", latestNotificationSchema);
