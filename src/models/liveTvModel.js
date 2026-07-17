const mongoose = require("mongoose");

const liveTvSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "Live TV",
    },
    playbackUrl: {
      type: String,
      default: "",
    },
    youtubeVideoId: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
      default: "",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveTV", liveTvSchema);
