const Comment = require("../models/commentsModel");
const News = require("../models/newsModel");
const mongoose = require("mongoose");
const Video = require("../models/videoModel");
const User = require("../models/userModel");
const LongVideo = require("../models/longVideoModel");


exports.createComment = async (req, res) => {
  try {
    const { userId, newsId, videoId, longVideoId, text } = req.body;

    const newComment = new Comment({
      user: new mongoose.Types.ObjectId(userId),
      news: newsId ? new mongoose.Types.ObjectId(newsId) : undefined,
      video: videoId ? new mongoose.Types.ObjectId(videoId) : undefined,
      longVideoRef: longVideoId ? new mongoose.Types.ObjectId(longVideoId) : undefined,
      comment: text,
      createdTime: new Date(),
    });

    const savedComment = await newComment.save();

    const populatedComment = await Comment.findById(savedComment._id)
      .populate("user", "email displayName")
      .populate("news", "title")
      .populate("video", "title")
      .populate("longVideoRef", "title");

    res.status(201).json({ success: true, data: populatedComment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
    //populate email
      // .populate("user", "email")
      .populate("user", "email displayName phone_Number") // Populating user with the displayName field
      .populate("news", "title") // Populating news with the title field
      .populate("video", "title"); // Populating video with the title field (corrected model name)
    // .populate("longVideoRef", "title"); // Populating longVideoRef with the title field
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
    // console.log(error);
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
exports.toggleLikeLongVideo = async (req, res) => {
  try {
    const { longVideoId, userId } = req.body;

    // Validate long video existence
    const longVideo = await LongVideo.findById(longVideoId);
    if (!longVideo) {
      return res
        .status(404)
        .json({ success: false, message: "Long video not found" });
    }

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the user has already liked the long video
    const alreadyLiked = longVideo.likedBy.includes(userId);

    if (!alreadyLiked) {
      // Like the long video: Add the userId to likedBy and increment total_Likes
      longVideo.likedBy.push(userId);
      longVideo.total_Likes += 1;
    } else {
      // Unlike the long video: Remove the userId from likedBy and decrement total_Likes
      longVideo.likedBy = longVideo.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      longVideo.total_Likes -= 1;
    }

    // Save the updated long video document
    await longVideo.save();

    res.status(200).json({ success: true, totalLikes: longVideo.total_Likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getCommentsByNewsIdandUserId = async (req, res) => {
  try {
    const { newsId, userId } = req.params;
    const comments = await Comment.find({ news: newsId, user: userId })
      .populate("user", "email displayName")
      .populate("news", "title");
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
