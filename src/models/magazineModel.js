const mongoose = require("mongoose");

const magazineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hindi: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  english: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  kannada: {
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  description: { type: String, required: true },
  createdTime: { type: Date, default: Date.now },
  last_updated: { type: Date },
  magazineThumbnail: { type: String },
  magazinePdf: { type: String },
  editionNumber: { type: Number },
});

module.exports = mongoose.model("Magazine", magazineSchema);
