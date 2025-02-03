const Comment = require("../models/commentsModel");
const News = require("../models/newsModel");
const mongoose = require("mongoose");

exports.createComment = async (req, res) => {
  try {
    const comment = new Comment(req.body);
    const savedComment = await comment.save();
    res.status(201).json({ success: true, data: savedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCommentByNewsId = async (req, res) => {
  try {
    const comments = await Comment.find({ news: req.params.id });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCommentsByUserId = async (req, res) => {
  try {
    const comments = await Comment.find({ user: req.params.id });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletecommentByuserId = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "No comment found" });
    }
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleLikeNews = async (req, res) => {
  try {
    const { newsId, userId } = req.body;
    const news = await News.findById(newsId);
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: "News not found" });
    }

    const existingLikeIndex = news.likedBy.findIndex(
      (like) => like.userId.toString() === userId
    );
    if (existingLikeIndex === -1) {
      // Like the news
      news.likedBy.push({ userId });
      news.total_Likes += 1;
    } else {
      // Unlike the news
      news.likedBy.splice(existingLikeIndex, 1);
      news.total_Likes -= 1;
    }

    await news.save();
    res.status(200).json({ success: true, total_Likes: news.total_Likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
