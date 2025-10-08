const mongoose = require('mongoose');

const bannerVersionSchema = new mongoose.Schema({
  bannerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Banner',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  },
  snapshot: {
    type: Object,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('BannerVersion', bannerVersionSchema);