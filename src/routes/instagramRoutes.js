const express = require("express");
const router = express.Router();
const instagramController = require("../controller/instagramController");

router.get("/media", instagramController.getMedia);
router.get("/reels", instagramController.getReels);

module.exports = router;
