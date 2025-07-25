const ReadingHistory = require('../models/readingHistoryModel');
const News = require('../models/newsModel');
// Add Blog model if you have one

// Log a reading event
exports.logReading = async (req, res) => {
  try {
    const { userId, contentId, contentType } = req.body;
    if (!userId || !contentId || !contentType) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    let category = undefined;
    let tags = undefined;
    if (contentType === 'news') {
      const news = await News.findById(contentId);
      if (news) {
        category = news.category;
        tags = news.tags;
      }
    }
    // If you have a Blog model, add similar logic here
    const history = new ReadingHistory({ userId, contentId, contentType, category, tags });
    await history.save();
    res.status(201).json({ message: 'Reading event logged.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get reading history for a user
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await ReadingHistory.find({ userId }).sort({ viewedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
