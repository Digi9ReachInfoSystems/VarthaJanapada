const Videos = require("../models/longVideoModel");
const Comment = require("../models/commentsModel");
const mongoose = require("mongoose");

const { Translate } = require("@google-cloud/translate").v2;

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
exports.uploadVideo = async (req, res) => {
  try {
    const { title, description, thumbnail, video_url, category } = req.body;

    // Validate required fields
    if (!title || !description || !thumbnail || !video_url || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields: title, description, videoThumbnail, videoUrl, category",
      });
    }

    // Define the target languages for translation
    const targetLanguages = ["en", "kn", "hi"]; // English, Kannada, Hindi

    // Translate the title and description into each language individually
    const titleTranslations = await Promise.all(
      targetLanguages.map(async (lang) => {
        return await translate.translate(title, lang);
      })
    );

    const descriptionTranslations = await Promise.all(
      targetLanguages.map(async (lang) => {
        return await translate.translate(description, lang);
      })
    );

    // Create a new video object with the translations
    const newVideo = new Videos({
      title, // Original title
      description, // Original description
      english: {
        title: titleTranslations[0][0], // English translation of the title
        description: descriptionTranslations[0][0], // English translation of description
      },
      kannada: {
        title: titleTranslations[1][0], // Kannada translation of the title
        description: descriptionTranslations[1][0], // Kannada translation of description
      },
      hindi: {
        title: titleTranslations[2][0], // Hindi translation of the title
        description: descriptionTranslations[2][0], // Hindi translation of description
      },
      thumbnail,
      video_url,
      category, // Assuming 'category' is passed in the request body
      videoDuration: req.body.videoDuration, // Optional, if provided
      last_updated: new Date(),
    });

    // Save the new video to the database
    const savedVideo = await newVideo.save();

    res.status(201).json({ success: true, data: savedVideo });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Videos.find().populate({
      path: "Comments", // Populate the Comments array
      populate: {
        // Populate the 'user' field within each comment
        path: "user", // Assuming your Comment model has a 'user' field referencing the User model
        select: "displayName profileImage", // Select which fields from the user you want to include (important for performance)
      },
    });

    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVideoId = async (req, res) => {
  try {
    const video = await Videos.findById(req.params.id).populate({
      path: "Comments",
      populate: {
        path: "user",
        select: "displayName profileImage", // Select the fields you need
      },
    });
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid videoId" });
    }

    // Log the videoId for debugging
    console.log("Video ID:", videoId);

    // Find the video
    const video = await Videos.findById(videoId);
    console.log("Video:", video); // Log the video for debugging

    if (!video) {
      return res
        .status(404)
        .json({ success: false, message: "Video not found" });
    }

    // Create a new comment
    const newComment = new Comment({
      user: userId,
      video: videoId,
      comment: text,
    });

    // Save the comment
    const savedComment = await newComment.save();
    console.log("Saved Comment:", savedComment); // Log the saved comment for debugging

    // Add the comment ID to the video's Comments array
    video.Comments.push(savedComment._id);
    await video.save();

    res.status(201).json({ success: true, data: savedComment });
  } catch (error) {
    console.error("Error adding comment:", error); // Log the error for debugging
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.deleteCommentByUserIdAndCommentId = async (req, res) => {
  try {
    const { userId, commentId } = req.body; // Extract userId and commentId

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId or commentId" });
    }

    // Find and delete the comment
    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      user: userId,
    });

    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    // Remove the comment reference from the associated video
    const video = await Video.findOneAndUpdate(
      { comments: commentId }, // Fixed: Use "comments" instead of "Comments"
      { $pull: { comments: commentId } }, // Fixed: Correct field name
      { new: true }
    );

    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
