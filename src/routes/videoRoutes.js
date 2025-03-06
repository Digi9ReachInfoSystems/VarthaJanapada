const express = require("express");
const router = express.Router();
const videoController = require("../controller/videoController");

// Route to upload a new video
router.post("/upload", videoController.uploadVideo);

// Route to get all videos
router.get("/mostLikedVideo", videoController.getMostLikedVideo);
router.get("/", videoController.getAllVideos);
router.get("/total-Videos", videoController.getTotalNumberOfVideos);
// Route to get a video by its ID
router.get("/:id", videoController.getVideoId);
router.post("/addComment", videoController.addCommentToVideo);

// Route to delete a video by its ID
router.delete("/:id", videoController.deleteVideo);
router.delete("/comment", videoController.deleteCommentByUserIdAndCommentId);
module.exports = router;
