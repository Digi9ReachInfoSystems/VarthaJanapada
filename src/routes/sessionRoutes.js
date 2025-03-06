const express = require("express");
const router = express.Router();
const sessionController = require("../controller/sessionController");

// Route to start a session
router.post("/start", sessionController.startSession);

// Route to end a session
router.post("/end", sessionController.endSession);

// Route to calculate average time spent (combined for web and mobile)
router.get("/average-time", sessionController.calculateAverageTimeSpent);

// Route to calculate average time by platform (web or mobile)
router.get(
  "/average-time/platform",
  sessionController.calculateAverageTimeByPlatform
);

module.exports = router;
