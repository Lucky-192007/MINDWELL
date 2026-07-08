const JournalEntry = require('../models/JournalEntry');
const { encrypt, decrypt } = require('../utils/encryption');

// Guided prompts served when the user doesn't know what to write
const PROMPTS = [
  'What made you smile today?',
  'What is one thing you are grateful for right now?',
  'Describe a moment today when you felt calm.',
  'What is weighing on your mind that you want to let go of?',
  'What is one small win from today?',
  'How did your body feel today?',
  'What would make tomorrow feel a little lighter?',
];

// @route GET /api/journal/prompt
const getDailyPrompt = (req, res) => {
  const dayIndex = new Date().getDate() % PROMPTS.length;
  res.json({ prompt: PROMPTS[dayIndex] });
};

// @route POST /api/journal
const createEntry = async (req, res) => {
  try {
    const { content, mood, energy, prompt } = req.body;

    if (!content || mood === undefined || energy === undefined) {
      return res.status(400).json({ message: 'content, mood and energy are required' });
    }

    // Encrypt BEFORE saving to MongoDB - raw DB never holds plaintext
    const encryptedContent = encrypt(content);

    const entry = await JournalEntry.create({
      user: req.user._id,
      prompt,
      content: encryptedContent,
      mood,
      energy,
    });

    // Return decrypted content to the user who just wrote it
    res.status(201).json({ ...entry.toObject(), content });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/journal
const getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id }).sort({ date: -1 });

    // Decrypt only here, at the moment the owner requests to read it
    const decrypted = entries.map((e) => ({
      ...e.toObject(),
      content: decrypt(e.content),
    }));

    res.json(decrypted);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/journal/:id
const getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    res.json({ ...entry.toObject(), content: decrypt(entry.content) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PUT /api/journal/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const { content, mood, energy } = req.body;
    if (content !== undefined) entry.content = encrypt(content);
    if (mood !== undefined) entry.mood = mood;
    if (energy !== undefined) entry.energy = energy;

    await entry.save();
    res.json({ ...entry.toObject(), content: content ?? decrypt(entry.content) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/journal/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDailyPrompt,
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
};
