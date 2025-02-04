const Comment = require("../models/commentsModel");
const News = require("../models/newsModel");
const mongoose = require("mongoose");
const Video = require("../models/videoModel");
const User = require("../models/userModel");

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
exports.toggleLikeVideo = async (req, res) => {
  try {
    const { videoId, userId } = req.body;

    // Validate video existence
    const video = await Video.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user has already liked the video
    const likedVideoIndex = user.likedVideos.findIndex(
      (likedVideo) => likedVideo.videoId.toString() === videoId
    );

    if (likedVideoIndex === -1) {
      // **Like the video**
      user.likedVideos.push({ videoId }); // Add to user's likedVideos
      video.total_Likes += 1;
      video.likedBy.push(userId); // Add userId to likedBy array in video
    } else {
      // **Unlike the video**
      user.likedVideos.splice(likedVideoIndex, 1); // Remove from user's likedVideos
      video.total_Likes -= 1;
      video.likedBy = video.likedBy.filter((id) => id.toString() !== userId); // Remove userId from likedBy array
    }

    // Save the updated documents
    await user.save();
    await video.save();

    res.status(200).json({ success: true, totalLikes: video.totalLikes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
