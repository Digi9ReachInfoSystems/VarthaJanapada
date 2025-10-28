const express = require("express");
const router = express.Router();
const commentController = require("../controller/commentController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

router.post("/createComment",authenticateJWT, allowedRoles(['user']), commentController.createComment);
router.get("/", commentController.getAllComments);
router.get("/: ", commentController.getCommentByNewsId);
router.get("/user/:id", commentController.getCommentsByUserId);
router.delete("/:id",authenticateJWT, allowedRoles(['admin']), commentController.deletecommentByuserId);
router.post("/likeLongVideo", commentController.toggleLikeLongVideo);
router.post("/like", commentController.toggleLikeNews);
router.post("/likeVideo", commentController.toggleLikeVideo);

router.get("/userandnews/:userId/:newsId", commentController.getCommentsByNewsIdandUserId);


module.exports = router;
