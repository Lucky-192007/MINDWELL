const nodemailer = require('nodemailer');
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const { decrypt } = require('./encryption');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const buildDigestHtml = (user, entries, periodLabel, totalWords) => {
  const avgMood = entries.length ? (entries.reduce((s, e) => s + e.mood, 0) / entries.length).toFixed(1) : '—';
  const avgEnergy = entries.length ? (entries.reduce((s, e) => s + e.energy, 0) / entries.length).toFixed(1) : '—';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050505; color: #F1EFFA; padding: 40px 0; width: 100%;">
      <div style="max-width: 480px; margin: 0 auto; background-color: #0A0A0A; border: 1px solid #1E1E2F; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
        
        <!-- Header Banner -->
        <div style="background: linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%); padding: 32px 24px; text-align: center;">
          <span style="font-size: 32px;">🌸</span>
          <h1 style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 12px 0 4px 0;">Your ${periodLabel} MindWell Review</h1>
          <p style="color: rgba(255,255,255,0.85); font-size: 13px; margin: 0;">A quiet look back at your mental wellness journey</p>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px 24px;">
          <p style="font-size: 15px; color: #F1EFFA; margin-top: 0;">Hi <b>${user.name}</b>,</p>
          <p style="font-size: 14px; color: #9490AC; line-height: 1.5;">Here is a summary of how your mind and reflections tracked over the past ${periodLabel}:</p>

          <!-- Metrics Grid Card -->
          <div style="background-color: #13131A; border: 1px solid #212133; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center;">
              <tr>
                <td style="width: 33%; border-right: 1px solid #212133; padding-right: 8px;">
                  <span style="display: block; font-size: 20px; font-weight: 700; color: #6C5CE7;">${entries.length}</span>
                  <span style="display: block; font-size: 11px; color: #9490AC; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">${entries.length === 1 ? 'Entry' : 'Entries'}</span>
                </td>
                <td style="width: 33%; border-right: 1px solid #212133; padding: 0 8px;">
                  <span style="display: block; font-size: 20px; font-weight: 700; color: #00CEC9;">${avgMood}/10</span>
                  <span style="display: block; font-size: 11px; color: #9490AC; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Avg Mood</span>
                </td>
                <td style="width: 33%; padding-left: 8px;">
                  <span style="display: block; font-size: 20px; font-weight: 700; color: #FDCB6E;">${totalWords}</span>
                  <span style="display: block; font-size: 11px; color: #9490AC; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px;">Words</span>
                </td>
              </tr>
            </table>
          </div>

          <!-- Insight Box -->
          <div style="background-color: #121212; border-left: 3px solid #6C5CE7; padding: 14px 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <p style="font-size: 13px; color: #D1CDFA; margin: 0; font-style: italic;">
              "Consistency is built one quiet reflection at a time. Thank you for showing up for yourself this ${periodLabel}."
            </p>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin-top: 28px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background-color: #6C5CE7; color: #FFFFFF; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block; box-shadow: 0 4px 12px rgba(108, 92, 231, 0.4);">Open Your Dashboard</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #070707; padding: 16px 24px; text-align: center; border-top: 1px solid #1A1A24;">
          <p style="font-size: 11px; color: #686482; margin: 0;">You're receiving this because ${periodLabel} digests are enabled in your MindWell profile.</p>
          <p style="font-size: 11px; color: #686482; margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} MindWell. Private & Encrypted.</p>
        </div>

      </div>
    </div>
  `;
};

// Sends a digest email for one user covering the given number of past days.
const sendDigestForUser = async (user, days, periodLabel) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const entries = await JournalEntry.find({ user: user._id, date: { $gte: since } });
  
  // Calculate approximate word count based on content length across entries
  let totalWords = 0;
  const processedEntries = entries.map((e) => {
    let plainContent = e.content || '';
    // If encrypted, decrypt if helper is available or handle safely
    try {
      if (typeof decrypt === 'function' && e.content) {
        plainContent = decrypt(e.content);
      }
    } catch (err) {
      // fallback if not encrypted or decryption fails
    }
    const wordCount = plainContent.trim() ? plainContent.trim().split(/\s+/).length : 0;
    totalWords += wordCount;

    return { mood: e.mood, energy: e.energy };
  });

  await transporter.sendMail({
    from: `"MindWell" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Your ${periodLabel} MindWell digest`,
    html: buildDigestHtml(user, processedEntries, periodLabel, totalWords),
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