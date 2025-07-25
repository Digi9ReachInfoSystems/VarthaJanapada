const express = require('express');
const router = express.Router();
const readingHistoryController = require('../controller/readingHistoryController');

// Log a reading event
router.post('/', readingHistoryController.logReading);

// Get reading history for a user
router.get('/:userId', readingHistoryController.getHistory);

module.exports = router;
