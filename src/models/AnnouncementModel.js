const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: {
    en: { type: String },
    hi: { type: String },
    kn: { type: String },
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
