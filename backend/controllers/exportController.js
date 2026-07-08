const JournalEntry = require('../models/JournalEntry');
const { decrypt } = require('../utils/encryption');
const { buildJsonExport, streamPdfExport } = require('../utils/exportData');

const getDecryptedEntries = async (userId) => {
  const entries = await JournalEntry.find({ user: userId }).sort({ date: 1 });
  return entries.map((e) => ({
    date: e.date,
    prompt: e.prompt,
    content: decrypt(e.content),
    mood: e.mood,
    energy: e.energy,
  }));
};

// @route GET /api/export/json
const exportJson = async (req, res) => {
  try {
    const entries = await getDecryptedEntries(req.user._id);
    const data = buildJsonExport(req.user, entries);
    res.setHeader('Content-Disposition', 'attachment; filename="mindwell-journal-export.json"');
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/export/pdf
const exportPdf = async (req, res) => {
  try {
    const entries = await getDecryptedEntries(req.user._id);
    streamPdfExport(res, req.user, entries);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { exportJson, exportPdf };
