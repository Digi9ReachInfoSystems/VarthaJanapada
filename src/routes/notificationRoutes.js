const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notificationController");

router.post("/createNotification", notificationController.createNotification);
router.get("/", notificationController.getAllNotifications);
// router.delete("/:id", notificationController.deleteNotification);
router.put(
  "/users/:userId/update-fcm-token",
  notificationController.updateFcmToken
);
module.exports = router;
