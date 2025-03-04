const mongoose = require("mongoose");
const LongVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  hindi: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  kannada: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  english: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  likedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
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
  total_Likes: {
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
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("LongVideo", LongVideoSchema);
