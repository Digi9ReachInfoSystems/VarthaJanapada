const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: [true, "English title is required."] },
    hi: { type: String, required: [true, "Hindi title is required."] },
    kn: { type: String, required: [true, "Kannada title is required."] },
  },

  createdTime: {
    type: Date,
    default: Date.now,
  },
  last_updated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Announcement", announcementSchema);
