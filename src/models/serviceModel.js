const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    English: {
      type: String,
    },
    kannada: {
      type: String,
    },
    hindi: {
      type: String,
    },
    link: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "newarticles" }
);

module.exports = mongoose.model("NewArticle", serviceSchema);
