const express = require("express");
const router = express.Router();
const videoCategoryController = require("../controller/videoCategoryController");
const allowedRoles = require("../middleware/allowedRole");
const authenticateJWT = require("../middleware/authenticateRole");

router.get("/", videoCategoryController.getAllVideoCategories);
router.get("/list", videoCategoryController.getAllVideoCategories);
router.post(
  "/create",
  authenticateJWT,
  allowedRoles(["admin", "moderator"]),
  videoCategoryController.createVideoCategory
);

module.exports = router;
