const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  contentType: { type: String, enum: ['news', 'blog', 'magazine'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tags' }],
  author: { type: String }, // Track author for better recommendations
  viewedAt: { type: Date, default: Date.now, index: true },
  timeSpent: { type: Number, default: 0 } // in seconds, for engagement tracking
});

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
