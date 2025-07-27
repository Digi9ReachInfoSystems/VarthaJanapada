const ReadingHistory = require('../models/readingHistoryModel');
const News = require('../models/newsModel');
const Magazine = require('../models/magazineModel');
const Magazine2 = require('../models/magazineModel2');
// Add Blog model if you have one

exports.getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await ReadingHistory.find({ userId });

    let news = [];
    let magazines = [];

    // --- Trending fallback for new users ---
    if (!history.length) {
      news = await News.find({ isLive: true })
        .populate('category', 'name hindi kannada English')
        .sort({ views: -1, createdAt: -1 })
        .limit(10);
      
      // Fetch from both magazine models
      const magazines1 = await Magazine.find()
        .sort({ publishedDate: -1 })
        .limit(5);
      const magazines2 = await Magazine2.find()
        .sort({ createdTime: -1 })
        .limit(5);
      
      // Combine and sort all magazines by date
      const allMagazines = [...magazines1, ...magazines2];
      magazines = allMagazines.sort((a, b) => {
        const dateA = a.publishedDate || a.createdTime;
        const dateB = b.publishedDate || b.createdTime;
        return new Date(dateB) - new Date(dateA);
      }).slice(0, 10);
      
      return res.json({ news, magazines });
    }

    // --- Smart Personalized News Recommendations ---
    const newsHistory = history.filter(h => h.contentType === 'news');
    
    if (newsHistory.length > 0) {
      // Calculate weighted preferences with time decay and engagement
      const now = new Date();
      const categoryScores = {};
      const tagScores = {};
      const authorScores = {};
      
      newsHistory.forEach(h => {
        const daysSinceViewed = (now - new Date(h.viewedAt)) / (1000 * 60 * 60 * 24);
        const timeDecay = Math.exp(-daysSinceViewed / 30); // 30-day half-life
        const engagementWeight = Math.min(h.timeSpent / 60, 2); // Cap at 2x for 2+ minutes
        
        const totalWeight = timeDecay * (1 + engagementWeight);
        
        // Score categories (HIGHEST PRIORITY - 3x weight)
        if (h.category) {
          const cat = h.category.toString();
          categoryScores[cat] = (categoryScores[cat] || 0) + (totalWeight * 3);
        }
        
        // Score tags (MEDIUM PRIORITY - 2x weight)
        if (h.tags && h.tags.length) {
          h.tags.forEach(tag => {
            const tagStr = tag.toString();
            tagScores[tagStr] = (tagScores[tagStr] || 0) + (totalWeight * 2);
          });
        }
        
        // Score authors (LOWER PRIORITY - 1x weight)
        if (h.author) {
          authorScores[h.author] = (authorScores[h.author] || 0) + totalWeight;
        }
      });
      
      // Get top 3 categories, 5 tags, and 3 authors for diversity
      const topCategories = Object.entries(categoryScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([cat]) => cat);
      
      const topTags = Object.entries(tagScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);
      
      const topAuthors = Object.entries(authorScores)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([author]) => author);
      
      // Build smart query with multiple categories, tags, and authors
      const query = { isLive: true };
      
      if (topCategories.length > 0 || topTags.length > 0 || topAuthors.length > 0) {
        query.$or = [];
        
        if (topCategories.length > 0) {
          query.$or.push({ category: { $in: topCategories } });
        }
        if (topTags.length > 0) {
          query.$or.push({ tags: { $in: topTags } });
        }
        if (topAuthors.length > 0) {
          query.$or.push({ author: { $in: topAuthors } });
        }
      }
      
      news = await News.find(query)
        .populate('category', 'name hindi kannada English')
        .sort({ createdAt: -1 })
        .limit(15); // Get more to allow for better selection
      
      // If we have enough news, prioritize by user preferences (Category > Tags > Author)
      if (news.length >= 10) {
        news = news.sort((a, b) => {
          const aCategoryScore = (categoryScores[a.category?._id?.toString()] || 0) * 3; // Category gets 3x weight
          const bCategoryScore = (categoryScores[b.category?._id?.toString()] || 0) * 3;
          const aTagScore = (a.tags?.reduce((sum, tag) => sum + (tagScores[tag.toString()] || 0), 0) || 0) * 2; // Tags get 2x weight
          const bTagScore = (b.tags?.reduce((sum, tag) => sum + (tagScores[tag.toString()] || 0), 0) || 0) * 2;
          const aAuthorScore = authorScores[a.author] || 0; // Author gets 1x weight
          const bAuthorScore = authorScores[b.author] || 0;
          
          return (bCategoryScore + bTagScore + bAuthorScore) - (aCategoryScore + aTagScore + aAuthorScore);
        }).slice(0, 10);
      }
    }
    
    // Fallback to trending news if no personalized results
    if (!news.length) {
      news = await News.find({ isLive: true })
        .populate('category', 'name hindi kannada English')
        .sort({ views: -1, createdAt: -1 })
        .limit(10);
    }

    // --- Magazines: Always latest ---
    // Fetch from both magazine models
    const magazines1 = await Magazine.find()
      .sort({ publishedDate: -1 })
      .limit(5);
    const magazines2 = await Magazine2.find()
      .sort({ createdTime: -1 })
      .limit(5);
    
    // Combine and sort all magazines by date
    const allMagazines = [...magazines1, ...magazines2];
    magazines = allMagazines.sort((a, b) => {
      const dateA = a.publishedDate || a.createdTime;
      const dateB = b.publishedDate || b.createdTime;
      return new Date(dateB) - new Date(dateA);
    }).slice(0, 10);

    res.json({ news, magazines });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};