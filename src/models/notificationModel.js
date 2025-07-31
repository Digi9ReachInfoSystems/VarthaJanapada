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
  userId: {
    type: [mongoose.Schema.Types.ObjectId], // Array of user IDs
    ref: "User",
    required: true,
  },
  last_updated: {
    type: Date,
  },
  fcm_token: [
    {
      type: String,
      required: [true, "A notification must have a fcm token"],
    },
  ],
  type: {
    type: String,
  },
  read: {
    type: Boolean,
    default: false,
  },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
});

module.exports = mongoose.model("Notification", notificationSchema);
