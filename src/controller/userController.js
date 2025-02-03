const User = require("../models/userModel");
const News = require("../models/newsModel");
const Category = require("../models/categoryModel");
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackNewsClick = async (req, res) => {
  try {
    const { newsId, userId } = req.body; // newsId will be passed in the request body

    // Check if the news exists
    const news = await News.findById(newsId);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user has already clicked this news
    const existingClick = user.clickedNews.find(
      (item) => item.newsId.toString() === newsId
    );
    if (existingClick) {
      // Update timestamp if the news is already in the clickedNews array
      existingClick.timestamp = new Date();
    } else {
      // Add the clicked news to the clickedNews array
      user.clickedNews.push({ newsId, timestamp: new Date() });
    }

    // Save the user data with the updated clickedNews
    await user.save();

    // Return a success response
    res
      .status(200)
      .json({ success: true, message: "News click tracked successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.recommendCategory = async (req, res) => {
  try {
    const { userId } = req.params; // Now we are getting the userId from the route parameters

    // Fetch the user's clicked news (via clickedNews array)
    const user = await User.findById(userId).populate("clickedNews.newsId");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Initialize an object to track the count of each category based on clicked news
    const categoryCount = {};

    // Loop through each clicked news and tally the categories
    user.clickedNews.forEach((clickedItem) => {
      const categoryId = clickedItem.newsId.category._id.toString();
      categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
    });

    // If the user has not interacted with any news, return an appropriate message
    if (Object.keys(categoryCount).length === 0) {
      return res.status(200).json({
        success: true,
        message: "No categories clicked by the user yet",
      });
    }

    // Sort the categories by the count of user interactions in descending order
    const sortedCategoryIds = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a]
    );

    // Fetch the top category based on user interactions
    const topCategoryId = sortedCategoryIds[0];
    const topCategory = await Category.findById(topCategoryId);

    if (!topCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Check if another category has more interactions than the current top category
    let recommendedCategory = topCategory;
    let maxInteractions = categoryCount[topCategoryId];

    // Iterate through the remaining categories to see if any has more interactions
    for (const categoryId of sortedCategoryIds.slice(1)) {
      if (categoryCount[categoryId] > maxInteractions) {
        recommendedCategory = await Category.findById(categoryId);
        maxInteractions = categoryCount[categoryId];
      }
    }

    // Fetch news articles from the recommended category (the one with the highest interactions)
    const recommendedNews = await News.find({
      category: recommendedCategory._id,
    })
      .sort({ createdTime: -1 }) // Sort by most recent
      .limit(5) // Limit to top 5 articles
      .populate("category", "name")
      .populate("tags", "name");

    // Return the recommended news articles along with the recommended category
    res.status(200).json({
      success: true,
      data: recommendedNews,
      recommendedCategory: recommendedCategory.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
