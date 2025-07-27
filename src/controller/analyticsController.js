const ReadingHistory = require('../models/readingHistoryModel');
const User = require('../models/userModel');
const News = require('../models/newsModel');
const Session = require('../models/sessionDuration');

// Get comprehensive user analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.viewedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get reading history
    const history = await ReadingHistory.find({ userId, ...dateFilter })
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort({ viewedAt: -1 });

    // Calculate analytics
    const analytics = {
      totalArticlesRead: history.length,
      totalTimeSpent: history.reduce((sum, h) => sum + (h.timeSpent || 0), 0),
      averageTimePerArticle: history.length > 0 ? 
        Math.round(history.reduce((sum, h) => sum + (h.timeSpent || 0), 0) / history.length) : 0,
      
      // Category preferences
      categoryBreakdown: {},
      tagBreakdown: {},
      authorBreakdown: {},
      
      // Reading patterns
      readingPatterns: {
        byHour: {},
        byDay: {},
        byMonth: {}
      }
    };

    // Analyze reading patterns
    history.forEach(h => {
      const date = new Date(h.viewedAt);
      const hour = date.getHours();
      const day = date.getDay();
      const month = date.getMonth();

      // Category breakdown
      if (h.category) {
        const catName = h.category.name || h.category.toString();
        analytics.categoryBreakdown[catName] = (analytics.categoryBreakdown[catName] || 0) + 1;
      }

      // Tag breakdown
      if (h.tags && h.tags.length) {
        h.tags.forEach(tag => {
          const tagName = tag.name || tag.toString();
          analytics.tagBreakdown[tagName] = (analytics.tagBreakdown[tagName] || 0) + 1;
        });
      }

      // Author breakdown
      if (h.author) {
        analytics.authorBreakdown[h.author] = (analytics.authorBreakdown[h.author] || 0) + 1;
      }

      // Time patterns
      analytics.readingPatterns.byHour[hour] = (analytics.readingPatterns.byHour[hour] || 0) + 1;
      analytics.readingPatterns.byDay[day] = (analytics.readingPatterns.byDay[day] || 0) + 1;
      analytics.readingPatterns.byMonth[month] = (analytics.readingPatterns.byMonth[month] || 0) + 1;
    });

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get content performance analytics
exports.getContentPerformance = async (req, res) => {
  try {
    const { contentId } = req.params;

    const history = await ReadingHistory.find({ contentId })
      .populate('userId', 'displayName');

    const performance = {
      totalViews: history.length,
      averageTimeSpent: history.length > 0 ? 
        Math.round(history.reduce((sum, h) => sum + (h.timeSpent || 0), 0) / history.length) : 0,
      uniqueReaders: new Set(history.map(h => h.userId._id.toString())).size,
      readerDemographics: {},
      engagementScore: 0
    };

    // Calculate engagement score
    const totalTime = history.reduce((sum, h) => sum + (h.timeSpent || 0), 0);
    performance.engagementScore = Math.round((totalTime / history.length) * 100) / 100;

    res.json(performance);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get trending content
exports.getTrendingContent = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trending = await ReadingHistory.aggregate([
      {
        $match: {
          viewedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$contentId',
          viewCount: { $sum: 1 },
          totalTimeSpent: { $sum: '$timeSpent' },
          contentType: { $first: '$contentType' }
        }
      },
      {
        $sort: { viewCount: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json(trending);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 