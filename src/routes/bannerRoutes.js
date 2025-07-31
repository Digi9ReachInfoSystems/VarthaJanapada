const express = require("express");
const router = express.Router();
const bannerController = require("../controller/bannerController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

router.post("/createBanner",authenticateJWT,allowedRoles(['admin','moderator']), bannerController.createBanner);
router.get("/", bannerController.getAllBanners);
router.delete("/deleteBanner/:id",authenticateJWT, allowedRoles(['admin']), bannerController.deleteBanner);
router.put("/updateBanner/:id", authenticateJWT, allowedRoles(['admin', 'moderator']), bannerController.updateBanner);
router.patch("/approveBanner/:id", authenticateJWT, allowedRoles(['admin']), bannerController.approveBanner);

module.exports = router;
