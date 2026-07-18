const express = require("express");
const router = express.Router();
const liveTvController = require("../controller/liveTvController");

// No auth — no login / Firebase token needed
router.get("/", liveTvController.getLiveTv);
router.post("/", liveTvController.upsertLiveTv);
router.post("/offline", liveTvController.setLiveTvOffline);
router.patch("/offline", liveTvController.setLiveTvOffline);

module.exports = router;
