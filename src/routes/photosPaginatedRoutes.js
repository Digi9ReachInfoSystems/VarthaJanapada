const express = require("express");
const router = express.Router();
const photosPaginatedController = require("../controller/photosPaginatedController");

router.get("/", photosPaginatedController.getAllPhotosPaginated);

module.exports = router;
