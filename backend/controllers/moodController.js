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

// @route GET /api/mood/insights
// Lightweight correlation analysis: day-of-week patterns, time-of-day patterns,
// and mood/energy correlation. Computed from mood+energy+date only (no decryption needed).
const getMoodInsights = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id }).select('mood energy date');

    if (entries.length < 5) {
      return res.json({ insights: [], message: 'Log a few more entries to unlock insights.' });
    }

    const insights = [];

    // Day-of-week averages
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const byDay = Array.from({ length: 7 }, () => []);
    entries.forEach((e) => byDay[new Date(e.date).getDay()].push(e.mood));
    const dayAverages = byDay.map((mts, i) => ({
      day: dayNames[i],
      avg: mts.length ? mts.reduce((a, b) => a + b, 0) / mts.length : null,
      count: mts.length,
    })).filter((d) => d.count >= 2);

    if (dayAverages.length >= 2) {
      const best = dayAverages.reduce((a, b) => (b.avg > a.avg ? b : a));
      const worst = dayAverages.reduce((a, b) => (b.avg < a.avg ? b : a));
      if (best.day !== worst.day) {
        insights.push(`Your mood tends to be highest on ${best.day}s (avg ${best.avg.toFixed(1)}/10) and lowest on ${worst.day}s (avg ${worst.avg.toFixed(1)}/10).`);
      }
    }

    // Time-of-day averages
    const buckets = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    entries.forEach((e) => {
      const h = new Date(e.date).getHours();
      if (h >= 5 && h < 12) buckets.Morning.push(e.mood);
      else if (h >= 12 && h < 17) buckets.Afternoon.push(e.mood);
      else if (h >= 17 && h < 22) buckets.Evening.push(e.mood);
      else buckets.Night.push(e.mood);
    });
    const timeAverages = Object.entries(buckets)
      .map(([label, arr]) => ({ label, avg: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null, count: arr.length }))
      .filter((t) => t.count >= 2);

    if (timeAverages.length >= 2) {
      const best = timeAverages.reduce((a, b) => (b.avg > a.avg ? b : a));
      insights.push(`You tend to write your most positive entries in the ${best.label.toLowerCase()} (avg ${best.avg.toFixed(1)}/10).`);
    }

    // Mood vs energy correlation (Pearson coefficient)
    const n = entries.length;
    const moods = entries.map((e) => e.mood);
    const energies = entries.map((e) => e.energy);
    const meanMood = moods.reduce((a, b) => a + b, 0) / n;
    const meanEnergy = energies.reduce((a, b) => a + b, 0) / n;
    let cov = 0, varMood = 0, varEnergy = 0;
    for (let i = 0; i < n; i++) {
      cov += (moods[i] - meanMood) * (energies[i] - meanEnergy);
      varMood += (moods[i] - meanMood) ** 2;
      varEnergy += (energies[i] - meanEnergy) ** 2;
    }
    const correlation = varMood && varEnergy ? cov / Math.sqrt(varMood * varEnergy) : 0;

    if (Math.abs(correlation) > 0.4) {
      insights.push(
        correlation > 0
          ? `Your mood and energy levels move together closely (correlation ${correlation.toFixed(2)}) - low energy days tend to be low mood days too.`
          : `Interestingly, your mood and energy don't move together much (correlation ${correlation.toFixed(2)}) - low energy doesn't necessarily mean low mood for you.`
      );
    }

    if (!insights.length) {
      insights.push("No strong patterns yet - keep journaling and check back as more entries build up.");
    }

    res.json({ insights, dayAverages, timeAverages, correlation });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getMoodHistory,
  getWeeklyAverage,
  getMonthlyAverage,
  getMoodDistribution,
  getMoodInsights,
};
