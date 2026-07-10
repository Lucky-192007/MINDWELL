const mongoose = require('mongoose');
const JournalEntry = require('../models/JournalEntry');

// @route GET /api/mood/history  (basic - free tier: last 30 days)
const getMoodHistory = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const entries = await JournalEntry.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo },
    })
      .select('mood energy date')
      .sort({ date: 1 });

    res.json(entries);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/mood/weekly-average  (premium: unlimited historical aggregation)
const getWeeklyAverage = async (req, res) => {
  try {
    const results = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: { year: { $isoWeekYear: '$date' }, week: { $isoWeek: '$date' } },
          avgMood: { $avg: '$mood' },
          avgEnergy: { $avg: '$energy' },
          entryCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/mood/monthly-average  (premium)
const getMonthlyAverage = async (req, res) => {
  try {
    const results = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          avgMood: { $avg: '$mood' },
          avgEnergy: { $avg: '$energy' },
          entryCount: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/mood/distribution  (pie chart: mood score buckets)
const getMoodDistribution = async (req, res) => {
  try {
    const results = await JournalEntry.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getMoodHistory,
  getWeeklyAverage,
  getMonthlyAverage,
  getMoodDistribution,
};
