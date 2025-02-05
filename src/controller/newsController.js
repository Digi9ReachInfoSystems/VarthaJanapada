const News = require("../models/newsModel");
const Category = require("../models/categoryModel");
const Tags = require("../models/tagsModel");
const { Translate } = require("@google-cloud/translate").v2;
const textToSpeech = require("@google-cloud/text-to-speech"); // Import TTS
const fs = require("fs");
const util = require("util");
const Comment = require("../models/commentsModel");
const mongoose = require("mongoose");

const base64Key = process.env.GOOGLE_CLOUD_KEY_BASE64;
if (!base64Key) {
  throw new Error(
    "GOOGLE_CLOUD_KEY_BASE64 is not set in environment variables"
  );
}
const credentials = JSON.parse(
  Buffer.from(base64Key, "base64").toString("utf-8")
);

const translate = new Translate({ credentials });
const ttsClient = new textToSpeech.TextToSpeechClient({ credentials });

exports.createNews = async (req, res) => {
  try {
    const { category, tags, ...newsData } = req.body;

    // Validate category existence
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    }

    // Validate tags existence
    if (tags && tags.length > 0) {
      const existingTags = await Tags.find({ _id: { $in: tags } });
      if (existingTags.length !== tags.length) {
        return res
          .status(400)
          .json({ success: false, message: "One or more tags are invalid" });
      }
    }

    const news = new News({ ...newsData, category, tags });
    const savedNews = await news.save();
    res.status(201).json({ success: true, data: savedNews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const newsList = await News.find()
      .sort({ createdTime: -1 })
      .populate("category", "name")
      .populate("tags", "name");

    res.status(200).json({ success: true, data: newsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate("category", "name")
      .populate("tags", "name")
      .populate({
        path: "comments", // Populate the comments field
        populate: { path: "user", select: "name" }, // Optionally populate the user who commented
      });

    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { category, tags, ...updateData } = req.body;

    // Validate category existence
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category ID" });
      }
    }

    // Validate tags existence
    if (tags && tags.length > 0) {
      const existingTags = await Tags.find({ _id: { $in: tags } });
      if (existingTags.length !== tags.length) {
        return res
          .status(400)
          .json({ success: false, message: "One or more tags are invalid" });
      }
    }

    const news = await News.findByIdAndUpdate(
      req.params.id,
      { ...updateData, category, tags },
      { new: true }
    )
      .populate("category", "name")
      .populate("tags", "name");

    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }
    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "News deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recommendCategory = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user is authenticated and userId is available

    // Fetch the user's clicked news
    const user = await User.findById(userId).populate("clickedNews.newsId");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Gather categories of the clicked news
    const categoryCount = {};
    user.clickedNews.forEach((clickedItem) => {
      const categoryId = clickedItem.newsId.category._id.toString();
      categoryCount[categoryId] = (categoryCount[categoryId] || 0) + 1;
    });

    // Sort categories by frequency
    const sortedCategoryIds = Object.keys(categoryCount).sort(
      (a, b) => categoryCount[b] - categoryCount[a]
    );

    // Fetch the top category
    const topCategoryId = sortedCategoryIds[0];
    const topCategory = await Category.findById(topCategoryId);

    if (!topCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Find news articles from the top category
    const recommendedNews = await News.find({ category: topCategoryId })
      .sort({ createdTime: -1 })
      .limit(5)
      .populate("category", "name")
      .populate("tags", "name");

    res.status(200).json({
      success: true,
      data: recommendedNews,
      recommendedCategory: topCategory.name,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.translateNews = async (req, res) => {
  try {
    const { id, targetLang } = req.params;

    if (!["en", "kn"].includes(targetLang)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid language code. Use 'en' for English or 'kn' for Kannada.",
      });
    }

    const news = await News.findById(id);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    const [translatedTitle] = await translate.translate(news.title, targetLang);
    const [translatedDescription] = await translate.translate(
      news.description,
      targetLang
    );

    res.status(200).json({
      success: true,
      original: { title: news.title, description: news.description },
      translated: {
        title: translatedTitle,
        description: translatedDescription,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchNews = async (req, res) => {
  try {
    const { query } = req.params;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Perform a case-insensitive search using regex
    const newsList = await News.find({
      title: { $regex: query, $options: "i" },
    })
      .sort({ createdTime: -1 })
      .populate("category", "name")
      .populate("tags", "name");

    if (newsList.length === 0) {
      return res.status(404).json({
        success: false,
        data: [],
        message: "No news articles found matching the search criteria",
      });
    }

    res.status(200).json({ success: true, data: newsList });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.addComment = async (req, res) => {
  try {
    const { userId, newsId, text } = req.body;

    if (!userId || !newsId || !text) {
      return res.status(400).json({
        success: false,
        message: "User ID, News ID, and text are required",
      });
    }

    // Create new comment
    const newComment = new Comment({
      user: userId,
      news: newsId,
      comment: text,
    });
    const savedComment = await newComment.save();

    // Push the comment to the news document's comments array
    await News.findByIdAndUpdate(newsId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json({ success: true, data: savedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId, userId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: userId,
    });
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found or you do not have permission to delete it",
      });
    }

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLatestNews = async (req, res) => {
  try {
    const latestNews = await News.find()
      .sort({ createdTime: -1 }) // Sort by newest first
      .limit(10) // Get only the latest 10 news articles
      .populate("category", "name") // Populate category name
      .populate("tags", "name"); // Populate tags name

    res.status(200).json({ success: true, data: latestNews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Ensure the category exists in the database before querying news
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    // Find news by category (No need for ObjectId conversion, use string comparison)
    const news = await News.find({ category: category })
      .populate("category", "name")
      .populate("tags", "name");

    if (!news || news.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No news articles found for this category",
      });
    }

    res.status(200).json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTotalNews = async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    res.status(200).json({ success: true, data: totalNews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
