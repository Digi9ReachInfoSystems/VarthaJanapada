const express = require("express");
const router = express.Router();
const videoPaginatedController = require("../controller/videoPaginatedController");

router.get("/", videoPaginatedController.getAllVideosPaginated);

module.exports = router;
