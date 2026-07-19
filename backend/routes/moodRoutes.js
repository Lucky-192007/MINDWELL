const express = require('express');
const router = express.Router();
const {
  getMoodHistory,
  getWeeklyAverage,
  getMonthlyAverage,
  getMoodDistribution,
  getMoodInsights,
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');
const { requirePremium } = require('../middleware/premium');

router.use(protect);

router.get('/history', getMoodHistory); // free tier - last 30 days
router.get('/distribution', getMoodDistribution); // free tier - pie chart
router.get('/insights', getMoodInsights); // free tier - correlation insights

// Advanced analytics - premium only
router.get('/weekly-average', requirePremium, getWeeklyAverage);
router.get('/monthly-average', requirePremium, getMonthlyAverage);

module.exports = router;
