const express = require("express");
const router = express.Router();
const newsPaginatedController = require("../controller/newsPaginatedController");

router.get(
  "/getLatestCombinedNews",
  newsPaginatedController.getLatestCombinedNewsPaginated
);

router.get(
  "/getNewsByNewsType/:newsType",
  newsPaginatedController.getNewsByNewsTypePaginated
);

module.exports = router;
