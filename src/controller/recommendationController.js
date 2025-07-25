const ReadingHistory = require('../models/readingHistoryModel');
const News = require('../models/newsModel');
const Magazine = require('../models/magazineModel');
// Add Blog model if you have one

exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await ReadingHistory.find({ userId });

    let news = [];
    let magazines = [];

    // --- Personalized News by Category (first) ---
    const newsHistory = history.filter(h => h.contentType === 'news');
    let favNewsCategory = null;
    let favTag = null;
    // Count categories
    const categoryCount = {};
    newsHistory.forEach(h => {
      if (h.category) {
        const cat = h.category.toString();
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
    });
    if (Object.keys(categoryCount).length > 0) {
      favNewsCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);
      news = await News.find({ isLive: true, category: favNewsCategory }).sort({ createdAt: -1 }).limit(10);
    }
    // If no category-based news, try tag
    if (!news.length) {
      const tagCount = {};
      newsHistory.forEach(h => {
        if (h.tags && h.tags.length) {
          h.tags.forEach(tag => {
            const tagStr = tag.toString();
            tagCount[tagStr] = (tagCount[tagStr] || 0) + 1;
          });
        }
      });
      if (Object.keys(tagCount).length > 0) {
        favTag = Object.keys(tagCount).reduce((a, b) => tagCount[a] > tagCount[b] ? a : b);
        news = await News.find({ isLive: true, tags: favTag }).sort({ createdAt: -1 }).limit(10);
      }
    }
    // Fallback to latest news
    if (!news.length) {
      news = await News.find({ isLive: true }).sort({ createdAt: -1 }).limit(10);
    }

    // --- Magazines: Always latest ---
    magazines = await Magazine.find().sort({ createdAt: -1 }).limit(10);

    res.json({ news, magazines });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
