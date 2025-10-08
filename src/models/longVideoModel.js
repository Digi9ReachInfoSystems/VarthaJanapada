const mongoose = require("mongoose");
const LongVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  hindi: {
    title: { type: String },
    description: { type: String },
  },
  kannada: {
    title: { type: String },
    description: { type: String },
  },
  english: {
    title: { type: String },
    description: { type: String },
  },

    magazineType: {
    type: String,
    enum: ["magazine", "magazine2"], // must match model names exactly
  },

    newsType: {
    type: String,
    enum: ["statenews", "districtnews", "specialnews"],
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
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("LongVideo", LongVideoSchema);
