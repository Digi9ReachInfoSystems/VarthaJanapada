const express = require("express");
const router = express.Router();
const youtubeController = require("../controller/youtubeController");

router.get("/latest-videos", youtubeController.getLatestVideos);
router.get("/shorts", youtubeController.getShorts);
router.get("/live", youtubeController.getLive);

module.exports = router;
