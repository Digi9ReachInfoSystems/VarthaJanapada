const ReadingHistory = require('../models/readingHistoryModel');
const News = require('../models/newsModel');
const Magazine = require('../models/magazineModel');

// Log a reading event
exports.logReading = async (req, res) => {
  try {
    const { userId, contentId, contentType, timeSpent } = req.body;
    if (!userId || !contentId || !contentType) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    let category = undefined;
    let tags = undefined;
    let author = undefined;

    if (contentType === 'news') {
      const news = await News.findById(contentId);
      if (news) {
        category = news.category;
        tags = news.tags;
        author = news.author; // Track author for better recommendations
      }
    }

    // Prevent duplicate logs
    const existing = await ReadingHistory.findOne({ userId, contentId, contentType });
    if (existing) {
      existing.viewedAt = new Date();
      if (typeof timeSpent === 'number') existing.timeSpent = timeSpent;
      if (author) existing.author = author; // Update author if available
      await existing.save();
      return res.status(200).json({ message: 'Reading event updated.' });
    }

    const history = new ReadingHistory({ 
      userId, 
      contentId, 
      contentType, 
      category, 
      tags, 
      author,
      timeSpent 
    });
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