const mongoose = require("mongoose");

const districtSchema = new mongoose.Schema(
  {
    district_name: { type: String },
    district_slug: { type: String, trim: true, lowercase: true },
    district_code: { type: String },
    english: { type: String },
    hindi: { type: String },
    kannada: { type: String },
    date_created: { type: Date },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { collection: "districts" }
);

districtSchema.index({ district_slug: 1 }, { unique: true });

module.exports = mongoose.model("District", districtSchema);
