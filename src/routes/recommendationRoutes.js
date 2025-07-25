const express = require('express');
const router = express.Router();
const recommendationController = require('../controller/recommendationController');

// Get recommendations for a user
router.get('/recommendations/:userId', recommendationController.getRecommendations);

module.exports = router; 