const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  Topics: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topics",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  video_url: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  Total_likes: {
    type: Number,
    default: 0,
  },
  Total_views: {
    type: Number,
    default: 0,
  },
  Comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comments",
    },
  ],
});

module.exports = mongoose.model("Video", videoSchema);
