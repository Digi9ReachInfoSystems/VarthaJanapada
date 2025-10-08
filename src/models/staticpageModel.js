
const mongoose = require("mongoose");

const staicPageSchema = new mongoose.Schema({

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