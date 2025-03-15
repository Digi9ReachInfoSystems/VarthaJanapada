const mongoose = require("mongoose");

const magazineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  hindi: {
    title: { type: String },
    description: { type: String },
  },
  english: {
    title: { type: String },
    description: { type: String },
  },
  kannada: {
    title: { type: String },
    description: { type: String },
  },
  description: { type: String },
  createdTime: { type: Date, default: Date.now },
  last_updated: { type: Date },
  magazineThumbnail: { type: String },
  magazinePdf: { type: String },
  editionNumber: { type: Number },
  publishedMonth: {
    type: String,
  },
  publishedYear: {
    type: String,
  },
});

module.exports = mongoose.model("Magazine", magazineSchema);
