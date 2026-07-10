require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const journalRoutes = require('./routes/journalRoutes');
const moodRoutes = require('./routes/moodRoutes');
const exportRoutes = require('./routes/exportRoutes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '6mb' }));

app.get('/', (req, res) => res.json({ message: 'MindWell API is running' }));

app.use('/api/auth', authRoutes);
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
