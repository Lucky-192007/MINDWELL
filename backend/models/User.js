const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null }, // NEW - Optional phone number
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: true },

    // Email verification / OTP (two-factor at registration)
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: null },
    otpExpires: { type: Date, default: null },

    // Preferences
    themeColor: { type: String, default: 'purple' }, // purple | teal | rose | amber
    notificationPrefs: {
      dailyReminder: { type: Boolean, default: false },
      reminderTime: { type: String, default: '20:00' },
      weeklyDigest: { type: Boolean, default: false },
      monthlyDigest: { type: Boolean, default: false },
    },
    promptCategories: {
      type: [String],
      default: ['gratitude', 'reflection', 'goals'],
    },
    aiReflectionEnabled: { type: Boolean, default: false },
    pushSubscription: { type: mongoose.Schema.Types.Mixed, default: null },

    // Lightweight activity log - most recent 30 actions
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Push an activity entry, keeping only the most recent 30
userSchema.methods.logActivity = function (action) {
  this.activityLog.unshift({ action, timestamp: new Date() });
  if (this.activityLog.length > 30) this.activityLog = this.activityLog.slice(0, 30);
};

module.exports = mongoose.model('User', userSchema);
