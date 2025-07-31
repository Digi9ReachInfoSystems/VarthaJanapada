const express = require("express");
const router = express.Router();
const videoController = require("../controller/longVideoController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");


router.post("/upload",authenticateJWT, allowedRoles(['admin', 'moderator']), videoController.uploadVideo);
router.post("/approveVideo/:id",authenticateJWT, allowedRoles(['admin']), videoController.approveLongVideo);
router.put("/update/:id",authenticateJWT, allowedRoles(['admin', 'moderator']), videoController.updateLongVideo);
router.get("/", videoController.getAllVideos);
router.get("/:id", videoController.getVideoId);
router.post("/addComment", videoController.addCommentToVideo);
router.delete("/:id",authenticateJWT, allowedRoles(['admin']), videoController.deleteVideo);
router.delete("/comment",authenticateJWT,allowedRoles(['admin','moderator']), videoController.deleteCommentByUserIdAndCommentId);
router.get("/longVideoHistory/:id", videoController.getLongVideoHistory);
router.post("/revertLongVideo/:id/revert/:versionNumber", videoController.revertLongVideoToVersion);
router.delete("/deleteLongVideoVersion/:id/delete/:versionNumber", videoController.deleteVideoVersioon);



module.exports = router;
