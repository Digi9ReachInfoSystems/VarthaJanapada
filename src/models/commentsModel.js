const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  news: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "News",
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  },
  longVideoRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LongVideo",
  },
  comment: {
    type: String,
    required: true,
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_updated: {
    type: Date,
  },
  hindi:{
    
  }
});

module.exports = mongoose.model("Comment", commentSchema);
