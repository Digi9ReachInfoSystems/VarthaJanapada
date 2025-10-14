const mongoose = require("mongoose");

const photosSchema = new mongoose.Schema({
  title: {
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
  photoImage: {
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

module.exports = mongoose.model("Photos", photosSchema);
