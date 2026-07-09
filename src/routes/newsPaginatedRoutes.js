const express = require("express");
const router = express.Router();
const newsPaginatedController = require("../controller/newsPaginatedController");

router.get(
  "/getNewsByNewsType/:newsType",
  newsPaginatedController.getNewsByNewsTypePaginated
);

module.exports = router;
