const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');

// Guided prompts, organized by category so users can pick which kinds they get
const PROMPTS_BY_CATEGORY = {
  gratitude: [
    'What is one thing you are grateful for right now?',
    'Who made a positive difference in your day?',
    'What small comfort did you enjoy today?',
  ],
  reflection: [
    'What made you smile today?',
    'Describe a moment today when you felt calm.',
    'How did your body feel today?',
  ],
  goals: [
    'What is one small win from today?',
    'What would make tomorrow feel a little lighter?',
    'What is weighing on your mind that you want to let go of?',
  ],
};

// @route GET /api/journal/prompt
const getDailyPrompt = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('promptCategories');
    const categories = user?.promptCategories?.length ? user.promptCategories : Object.keys(PROMPTS_BY_CATEGORY);
    const pool = categories.flatMap((c) => PROMPTS_BY_CATEGORY[c] || []);
    const finalPool = pool.length ? pool : Object.values(PROMPTS_BY_CATEGORY).flat();
    const dayIndex = new Date().getDate() % finalPool.length;
    res.json({ prompt: finalPool[dayIndex] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/journal
const createEntry = async (req, res) => {
  try {
    const { content, mood, energy, prompt } = req.body;

    if (!content || mood === undefined || energy === undefined) {
      return res.status(400).json({ message: 'content, mood and energy are required' });
    }

    const encryptedContent = encrypt(content);

    const entry = await JournalEntry.create({
      user: req.user._id,
      prompt,
      content: encryptedContent,
      mood,
      energy,
    });

    res.status(201).json({ ...entry.toObject(), content });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/journal
const getEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user._id }).sort({ date: -1 });
    const decrypted = entries.map((e) => ({ ...e.toObject(), content: decrypt(e.content) }));
    res.json(decrypted);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/journal/:id
const getEntryById = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ ...entry.toObject(), content: decrypt(entry.content) });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PUT /api/journal/:id
const updateEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const { content, mood, energy, starred } = req.body;
    if (content !== undefined) entry.content = encrypt(content);
    if (mood !== undefined) entry.mood = mood;
    if (energy !== undefined) entry.energy = energy;
    if (starred !== undefined) entry.starred = starred;

    await entry.save();
    res.json({ ...entry.toObject(), content: content ?? decrypt(entry.content) });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/journal/:id
const deleteEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/journal/import
// Accepts JSON in the same shape as our own export format and bulk-creates entries.
const importEntries = async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || !entries.length) {
      return res.status(400).json({ message: 'No entries found in the uploaded file' });
    }

    const docs = entries
      .filter((e) => e.content && e.mood !== undefined && e.energy !== undefined)
      .map((e) => ({
        user: req.user._id,
        prompt: e.prompt || '',
        content: encrypt(e.content),
        mood: e.mood,
        energy: e.energy,
        date: e.date ? new Date(e.date) : new Date(),
      }));

    if (!docs.length) {
      return res.status(400).json({ message: 'No valid entries to import' });
    }

    await JournalEntry.insertMany(docs);
    res.json({ message: `Imported ${docs.length} entries`, count: docs.length });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getDailyPrompt,
  createEntry,
  getEntries,
  getEntryById,
  updateEntry,
  deleteEntry,
  importEntries,
};
