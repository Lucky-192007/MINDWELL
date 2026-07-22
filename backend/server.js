require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const { runWeeklyDigests, runMonthlyDigests } = require('./utils/digest');

const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const moodRoutes = require('./routes/moodRoutes');
const exportRoutes = require('./routes/exportRoutes');

connectDB();

const app = express();
const themeRoutes = require('./routes/themeRoutes');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '6mb' }));


app.get('/', (req, res) => res.json({ message: 'MindWell API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/export', exportRoutes);

// Global error handler (catches anything not handled in controllers,
// e.g. body-parser errors like an oversized upload)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Upload is too large. Please choose a smaller image.' });
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MindWell backend running on port ${PORT}`));

// Weekly digest: every Monday at 8am server time.
cron.schedule('0 8 * * 1', () => {
  runWeeklyDigests().then((n) => console.log(`Weekly digest sent to ${n} users`)).catch(console.error);
});

// Monthly digest: 1st of the month at 8am server time.
cron.schedule('0 8 1 * *', () => {
  runMonthlyDigests().then((n) => console.log(`Monthly digest sent to ${n} users`)).catch(console.error);
});

// Daily reminders: checks every minute for users whose reminderTime matches current HH:MM
cron.schedule('* * * * *', async () => {
  try {
    const User = require('./models/User');
    const { transporter } = require('./utils/email');

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

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