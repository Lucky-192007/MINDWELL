const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    colors: {
      primary: { type: String, default: '#6C5CE7' },
      secondary: { type: String, default: '#8B7FF2' },
      background: { type: String, default: '#000000' },
      elevated: { type: String, default: '#131313' },
      sidebar: { type: String, default: '#0A0A0A' },
      text: { type: String, default: '#F1EFFA' },
      textSecondary: { type: String, default: '#9490AC' },
      border: { type: String, default: '#212121' },
      danger: { type: String, default: '#F0837E' },
    },

    isPublic: { type: Boolean, default: false },
    downloads: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theme', themeSchema);