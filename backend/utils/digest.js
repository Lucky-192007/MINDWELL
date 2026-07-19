const nodemailer = require('nodemailer');
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const { decrypt } = require('./encryption');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const buildDigestHtml = (user, entries, periodLabel) => {
  const avgMood = entries.length ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1) : '—';
  const avgEnergy = entries.length ? (entries.reduce((s, e) => s + e.energy, 0) / entries.length).toFixed(1) : '—';

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #6C5CE7;">Your ${periodLabel} MindWell digest</h2>
      <p>Hi ${user.name},</p>
      <p>Here's how things looked over the past ${periodLabel}:</p>
      <ul style="line-height: 1.8;">
        <li><strong>${entries.length}</strong> journal ${entries.length === 1 ? 'entry' : 'entries'}</li>
        <li>Average mood: <strong>${avgMood}/10</strong></li>
        <li>Average energy: <strong>${avgEnergy}/10</strong></li>
      </ul>
      <p style="color: #8B889C; font-size: 13px;">Keep going - open MindWell to see your full trends.</p>
    </div>
  `;
};

// Sends a digest email for one user covering the given number of past days.
const sendDigestForUser = async (user, days, periodLabel) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const entries = await JournalEntry.find({ user: user._id, date: { $gte: since } });
  const decrypted = entries.map((e) => ({ mood: e.mood, energy: e.energy }));

  await transporter.sendMail({
    from: `"MindWell" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your ${periodLabel} MindWell digest`,
    html: buildDigestHtml(user, decrypted, periodLabel),
  });
};

// Runs across all opted-in users. Called by the cron schedule in server.js,
// or manually via POST /api/journal/digest/trigger for demo/testing.
const runWeeklyDigests = async () => {
  const users = await User.find({ 'notificationPrefs.weeklyDigest': true });
  for (const user of users) {
    try { await sendDigestForUser(user, 7, 'weekly'); } catch (e) { console.error('Digest failed for', user.email, e.message); }
  }
  return users.length;
};

const runMonthlyDigests = async () => {
  const users = await User.find({ 'notificationPrefs.monthlyDigest': true });
  for (const user of users) {
    try { await sendDigestForUser(user, 30, 'monthly'); } catch (e) { console.error('Digest failed for', user.email, e.message); }
  }
  return users.length;
};

module.exports = { runWeeklyDigests, runMonthlyDigests, sendDigestForUser };
