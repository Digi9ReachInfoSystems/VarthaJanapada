const mongoose = require("mongoose");

const staicPageSchema = new mongoose.Schema({
  staticpageName: {
    type: String,
    required: true,
  },
  staticpageImage: {
    type: String,
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
  staticpageLink: {
    type: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_updated: {
    type: Date,
  },
});

module.exports = mongoose.model("StaticPage", staicPageSchema);
