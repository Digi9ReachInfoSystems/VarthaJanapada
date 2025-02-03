const express = require("express");
const router = express.Router();
const bannerController = require("../controller/bannerController");

router.post("/createBanner", bannerController.createBanner);
router.get("/", bannerController.getAllBanners);
router.delete("/:id", bannerController.deleteBanner);

module.exports = router;
