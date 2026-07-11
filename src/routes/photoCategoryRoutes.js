const express = require("express");
const router = express.Router();
const photoCategoryController = require("../controller/photoCategoryController");
const allowedRoles = require("../middleware/allowedRole");
const authenticateJWT = require("../middleware/authenticateRole");

router.get("/", photoCategoryController.getAllPhotoCategories);
router.get("/list", photoCategoryController.getAllPhotoCategories);
router.post(
  "/create",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  photoCategoryController.createPhotoCategory
);

module.exports = router;
