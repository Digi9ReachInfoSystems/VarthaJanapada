const express = require("express");
const router = express.Router();
const longVideoPaginatedController = require("../controller/longVideoPaginatedController");

router.get("/", longVideoPaginatedController.getAllVideosPaginated);

module.exports = router;
