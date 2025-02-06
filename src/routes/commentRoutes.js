const express = require("express");
const router = express.Router();
const commentController = require("../controller/commentController");

router.post("/createComment", commentController.createComment);
router.get("/", commentController.getAllComments);
router.get("/:id", commentController.getCommentByNewsId);
router.get("/user/:id", commentController.getCommentsByUserId);
router.delete("/:id", commentController.deletecommentByuserId);
router.post("/likeLongVideo", commentController.toggleLikeLongVideo);
router.post("/like", commentController.toggleLikeNews);
router.post("/likeVideo", commentController.toggleLikeVideo);

module.exports = router;
