const express = require("express");
const router = express.Router();
const instagramController = require("../controller/instagramController");

router.get("/media", instagramController.getMedia);

module.exports = router;
