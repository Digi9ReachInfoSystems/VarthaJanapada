const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");
const globalPlaylistController = require("../controller/playlistController");

// Add any item to playlist
router.post(
  "/add",
  authenticateJWT,
  allowedRoles(["user"]),
  globalPlaylistController.addToPlaylist
);

// Remove any item from playlist
router.delete(
  "/remove",
  authenticateJWT,
  allowedRoles(["user"]),
  globalPlaylistController.removeFromPlaylist
);

// Get playlist by type
router.get(
  "/get/:userId",
  authenticateJWT,
  allowedRoles(["user"]),
  globalPlaylistController.getAllPlaylists
);

module.exports = router;
