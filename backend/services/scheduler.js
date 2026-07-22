const cron = require('node-cron');
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const { transporter } = require('../utils/email'); // Ensure transporter is exported from your email.js

// Run every minute to check for daily reminders based on user's selected time (HH:MM)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    // Find users with daily reminders set for this exact minute
    const usersToRemind = await User.find({
      'notificationPrefs.dailyReminder': true,
      'notificationPrefs.reminderTime': currentTime,
      'notificationPrefs.reminderMethod': 'email',
      email: { $ne: null }
    });

    for (const user of usersToRemind) {
      await transporter.sendMail({
        from: `"MindWell" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Time for your MindWell daily reflection 🌸',
        html: `
          <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; background: #0A0A0A; color: #F1EFFA; padding: 24px; border-radius: 12px;">
            <h2 style="color: #6C5CE7;">Daily Reminder</h2>
            <p>Hi ${user.name},</p>
            <p>Take a quiet moment to log your thoughts and feelings today.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/write" style="display: inline-block; background: #6C5CE7; color: #FFF; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 12px;">Write Journal Entry</a>
          </div>
        `,
      });
      console.log(`Daily reminder sent to ${user.email}`);
    }
  } catch (err) {
    console.error('Error running daily reminder cron:', err);
  }
});

// Run every Monday at 8:00 AM for Weekly Digests
cron.schedule('0 8 * * 1', async () => {
  try {
    const users = await User.find({ 'notificationPrefs.weeklyDigest': true, email: { $ne: null } });
    for (const user of users) {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const count = await JournalEntry.countDocuments({ user: user._id, createdAt: { $gte: oneWeekAgo } });

      await transporter.sendMail({
        from: `"MindWell" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Weekly MindWell Digest 📊',
        html: `
          <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; background: #0A0A0A; color: #F1EFFA; padding: 24px; border-radius: 12px;">
            <h2 style="color: #6C5CE7;">Weekly Digest</h2>
            <p>Hi ${user.name},</p>
            <p>You wrote <b>${count}</b> journal entries this past week. Keep up the great work reflecting on your mind!</p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error('Error running weekly digest cron:', err);
  }
});

// Run on the 1st of every month at 8:00 AM for Monthly Digests
cron.schedule('0 8 1 * *', async () => {
  try {
    const users = await User.find({ 'notificationPrefs.monthlyDigest': true, email: { $ne: null } });
    for (const user of users) {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const count = await JournalEntry.countDocuments({ user: user._id, createdAt: { $gte: oneMonthAgo } });

      await transporter.sendMail({
        from: `"MindWell" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Your Monthly MindWell Digest 📈',
        html: `
          <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto; background: #0A0A0A; color: #F1EFFA; padding: 24px; border-radius: 12px;">
            <h2 style="color: #6C5CE7;">Monthly Summary</h2>
            <p>Hi ${user.name},</p>
            <p>Over the past month, you created <b>${count}</b> journal entries. Thank you for making MindWell part of your wellness journey.</p>
          </div>
        `,
      });
    }
  } catch (err) {
    console.error('Error running monthly digest cron:', err);
  }
});