const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  phone_Number: {
    type: Number,
    // required: true,
    // unique: true,
  },
  email: {
    type: String,
    // required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "moderator", "content"],
    default: "content",
  },

  displayName: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_logged_in: {
    type: Date,
  },
  fcmToken: {
    type: String,
  },
  profileImage: {
    type: String,
  },

  preferences: {
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  },

  clickedNews: [
    {
      newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
      timestamp: { type: Date, default: Date.now },
    },
  ],

  likedNews: [
    {
      newsId: { type: mongoose.Schema.Types.ObjectId, ref: "News" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  likedVideos: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  categoryPreferences: {
    type: Map,
    of: Number,
    default: {},
  },
});

module.exports = mongoose.model("User", userSchema);
