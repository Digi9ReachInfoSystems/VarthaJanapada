const express = require("express");
const router = express.Router();
const videoController = require("../controller/videoController");

const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");
const { all } = require("axios");
// Route to upload a new video
router.post("/upload",authenticateJWT, allowedRoles(['admin', 'moderator']), videoController.uploadVideo);

// Route to get all videos
router.get("/mostLikedVideo", videoController.getMostLikedVideo);
router.get("/", videoController.getAllVideos);
router.get("/total-Videos", videoController.getTotalNumberOfVideos);
router.get("/:id", videoController.getVideoId);
router.post("/addComment", videoController.addCommentToVideo);
router.delete("/:id",authenticateJWT, allowedRoles(['admin']), videoController.deleteVideo);
router.delete("/comment",authenticateJWT,allowedRoles(['admin','moderator']), videoController.deleteCommentByUserIdAndCommentId);

router.put("/update/:id",authenticateJWT, allowedRoles(['admin', 'moderator']), videoController.updateVideo);

router.post("/approveVideo/:id",authenticateJWT, allowedRoles(['admin']), videoController.approveVideo);

router.get("/getVideoHistory/:id", videoController.getVideoHistory);
router.post("/revertVideo/:id/revert/:versionNumber", videoController.revertVideoToVersion);
router.delete("/deleteVideoVersion/:id/delete/:versionNumber", videoController.deleteVersion);

router.post("/addshorts/playlist", authenticateJWT, allowedRoles(['user']), videoController.addShortVideoToPlaylist);
router.put("/removeshorts/playlist", authenticateJWT, allowedRoles(['user']), videoController.removeShortVideoFromPlaylist);
router.get("/getuser/shortsvideo/:userId", authenticateJWT, allowedRoles(['user']), videoController.getShortVideoPlaylist);
module.exports = router;
