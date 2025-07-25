const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  contentType: { type: String, enum: ['news', 'blog', 'magazine'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tags' }],
  viewedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
