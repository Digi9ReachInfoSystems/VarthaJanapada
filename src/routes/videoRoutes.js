const express = require("express");
const router = express.Router();
const videoController = require("../controller/videoController");

// Route to upload a new video
router.post("/upload", videoController.uploadVideo);

// Route to get all videos
router.get("/", videoController.getAllVideos);

// Route to get a video by its ID
router.get("/:id", videoController.getVideoId);

// Route to delete a video by its ID
router.delete("/:id", videoController.deleteVideo);

module.exports = router;
