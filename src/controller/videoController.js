const Videos = require("../models/videoModel");
const Comment = require("../models/commentsModel");

exports.uploadVideo = async (req, res) => {
  try {
    const video = new Videos(req.body);
    const savedVideo = await video.save();
    res.status(201).json({ success: true, data: savedVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Videos.find().populate("Comments"); // Populate the comments
    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVideoId = async (req, res) => {
  try {
    const video = await Videos.findById(req.params.id);
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    const video = await Videos.findByIdAndDelete(req.params.id);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "No video found" });
    }
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.addCommentToVideo = async (req, res) => {
  try {
    const { userId, videoId, text } = req.body;

    const video = await Videos.findById(videoId);
    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    const newComment = new Comment({
      // Create a new Comment document
      user: userId,
      video: videoId,
      comment: text,
    });

    const savedComment = await newComment.save(); // Save the comment FIRST

    video.Comments.push(savedComment._id); // Push the comment's _id into the video's comments array
    await video.save(); // Save the updated video

    res.status(201).json({ success: true, data: savedComment }); // Respond with the saved comment
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
