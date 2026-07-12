const express = require("express");
const router = express.Router();
const newsPaginatedController = require("../controller/newsPaginatedController");

router.get(
  "/getLatestCombinedNews",
  newsPaginatedController.getLatestCombinedNewsPaginated
);

router.get(
  "/getAllLatestNews",
  newsPaginatedController.getAllLatestNewsPaginated
);

router.get(
  "/getStateNews",
  newsPaginatedController.getStateNewsPaginated
);

router.get(
  "/getSpecialNews",
  newsPaginatedController.getSpecialNewsPaginated
);

router.get(
  "/getArticles",
  newsPaginatedController.getArticlesPaginated
);

router.get(
  "/getNewsByNewsType/:newsType",
  newsPaginatedController.getNewsByNewsTypePaginated
);

router.get(
  "/trending",
  newsPaginatedController.getTrendingNews
);

module.exports = router;
