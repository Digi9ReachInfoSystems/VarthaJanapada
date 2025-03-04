const express = require("express");
const router = express.Router();
const newsController = require("../controller/newsController");
router.get("/total-news", newsController.getTotalNews);
router.get("/latest", newsController.getLatestNews);
router.post("/createNews", newsController.createNews);
router.get("/", newsController.getAllNews);
router.get("/:id", newsController.getNewsById);

router.put("/:id", newsController.updateNews);
router.delete("/:id", newsController.deleteNews);
router.get("/translate/:id/:targetLang", newsController.translateNews);

router.post("/addComment", newsController.addComment);
router.delete(
  "/deleteComment/:commentId/:userId",
  newsController.deleteComment
);
router.get("/search/:query", newsController.searchNews);A
router.get("/categories/:category", newsController.getNewsByCategory);

module.exports = router;
