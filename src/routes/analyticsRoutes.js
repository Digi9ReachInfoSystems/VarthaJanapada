const express = require('express');
const router = express.Router();
const analyticsController = require('../controller/analyticsController');

// Get user analytics
router.get('/user/:userId', analyticsController.getUserAnalytics);

// Get content performance
router.get('/content/:contentId', analyticsController.getContentPerformance);

// Get trending content
router.get('/trending', analyticsController.getTrendingContent);

module.exports = router; 