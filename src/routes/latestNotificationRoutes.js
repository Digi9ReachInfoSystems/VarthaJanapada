const express = require("express");
const router = express.Router();
const latestNotificationController = require("../controller/latestNotificationController");
const authenticateJWT = require("../middleware/authenticateRole");
const allowedRoles = require("../middleware/allowedRole");

router.post("/createlatestNotification",authenticateJWT,allowedRoles(['admin','moderator']), latestNotificationController.createLatestNotification);
router.get("/getAlllatestNotification", latestNotificationController.getAllLatestNotifications);
router.get("/:id", latestNotificationController.getAllLatestNotificationById);
router.delete("/deletelatestNotification/:id",authenticateJWT, allowedRoles(['admin']), latestNotificationController.deleteLatestNotification);

module.exports = router;