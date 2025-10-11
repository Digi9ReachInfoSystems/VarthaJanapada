// src/routes/uploadsRoutes.js
const express = require("express");
const multer = require("multer");
const { uploadMedia } = require("../config/azureService");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/upload",
  authenticateJWT,                                  // optional if needed
  allowedRoles(["admin", "moderator"]),             // optional if needed
  upload.single("file"),
  uploadMedia
);

module.exports = router;
