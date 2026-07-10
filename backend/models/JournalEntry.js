const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    prompt: { type: String }, // the guided prompt shown, e.g. "What made you smile today?"
    content: { type: String, required: true }, // ENCRYPTED text (never plaintext) - "iv:ciphertext"
    mood: { type: Number, min: 1, max: 10, required: true },
    energy: { type: Number, min: 1, max: 10, required: true },
    starred: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JournalEntry', journalEntrySchema);
