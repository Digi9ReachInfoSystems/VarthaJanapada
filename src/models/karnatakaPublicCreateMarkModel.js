const mongoose = require("mongoose");

/**
 * Marks district news successfully created on Public.
 * Separate collection — does not modify news documents.
 */
const karnatakaPublicCreateMarkSchema = new mongoose.Schema(
  {
    articleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    title: { type: String, default: "" },
    district: { type: String, default: "" },
    requestId: { type: String, default: "" },
    publicId: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "KarnatakaPublicCreateMark",
  karnatakaPublicCreateMarkSchema
);
