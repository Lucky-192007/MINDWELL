const JournalEntry = require('../models/JournalEntry');
const User = require('../models/User');
const crypto = require('crypto');
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
    const { content, mood, energy, prompt, isRichText } = req.body;

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
      isRichText: !!isRichText,
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

    const { content, mood, energy, starred, isRichText } = req.body;
    if (content !== undefined) entry.content = encrypt(content);
    if (mood !== undefined) entry.mood = mood;
    if (energy !== undefined) entry.energy = energy;
    if (starred !== undefined) entry.starred = starred;
    if (isRichText !== undefined) entry.isRichText = isRichText;

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

// Guided journaling templates - structured multi-question formats.
// Returned as a static list; the frontend assembles the answers into one entry.
const TEMPLATES = [
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    questions: [
      'What went well today?',
      'What was challenging?',
      'What will you do differently tomorrow?',
    ],
  },
  {
    id: 'gratitude-list',
    name: 'Gratitude List',
    questions: [
      'Name three things you are grateful for today.',
      'Who is someone you appreciate right now, and why?',
    ],
  },
  {
    id: 'thought-record',
    name: 'Thought Record (CBT-style)',
    questions: [
      'What situation triggered a strong emotion today?',
      'What thought went through your mind?',
      'What is the evidence for and against that thought?',
      'What is a more balanced way to see it?',
    ],
  },
  {
    id: 'goal-check-in',
    name: 'Goal Check-In',
    questions: [
      'What is one goal you are working toward?',
      'What progress did you make this week?',
      'What is one small next step?',
    ],
  },
];

// @route GET /api/journal/templates
const getTemplates = (req, res) => {
  res.json(TEMPLATES);
};

// @route POST /api/journal/:id/share
// Generates (or refreshes) a share token for one entry, valid for 7 days.
const shareEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    entry.shareToken = crypto.randomBytes(16).toString('hex');
    entry.shareExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await entry.save();

    res.json({ shareToken: entry.shareToken, expiresAt: entry.shareExpires });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/journal/:id/share
const revokeShare = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    entry.shareToken = null;
    entry.shareExpires = null;
    await entry.save();
    res.json({ message: 'Share link revoked' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/journal/shared/:token
// PUBLIC route (no auth) - only returns the one entry matching a valid, unexpired token.
const getSharedEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({ shareToken: req.params.token });
    if (!entry || !entry.shareExpires || entry.shareExpires < new Date()) {
      return res.status(404).json({ message: 'This share link is invalid or has expired' });
    }
    res.json({
      content: decrypt(entry.content),
      mood: entry.mood,
      energy: entry.energy,
      date: entry.date,
      prompt: entry.prompt,
      isRichText: entry.isRichText,
    });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/journal/:id/reflect
// AI-assisted reflection: sends the (decrypted, in-memory only) entry text to an LLM
// and returns one gentle follow-up question. Opt-in only - see README for the privacy note.
const getAiReflection = async (req, res) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ message: 'AI reflection is not configured on this server yet.' });
    }

    const user = await User.findById(req.user._id).select('aiReflectionEnabled');
    if (!user.aiReflectionEnabled) {
      return res.status(403).json({ message: 'Enable AI reflection in your profile settings first.' });
    }

    const entry = await JournalEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const plainText = decrypt(entry.content);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `You are a gentle, non-clinical journaling companion. Read this private journal entry and respond with ONE short, warm, open-ended follow-up question (max 2 sentences) to help the writer reflect further. Do not give advice, diagnoses, or judgments - just one caring question.\n\nEntry:\n${plainText}`,
          },
        ],
      }),
    });

    const data = await response.json();
    const reflection = data?.content?.[0]?.text || 'What feels most important about this to you right now?';

    res.json({ reflection });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/journal/digest/send-now
// Lets a user trigger their own weekly digest email immediately, useful for testing
// since the real weekly/monthly cron only fires while the server process stays running.
const sendDigestNow = async (req, res) => {
  try {
    const { sendDigestForUser } = require('../utils/digest');
    await sendDigestForUser(req.user, 7, 'weekly');
    res.json({ message: 'Digest email sent' });
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
  getTemplates,
  shareEntry,
  revokeShare,
  getSharedEntry,
  getAiReflection,
  sendDigestNow,
};
