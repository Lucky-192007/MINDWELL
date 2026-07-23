const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String,  unique: true, sparse: true, trim: true },
    password: { type: String, required: true },
    loginMethod: { type: String, enum: ['email', 'phone'], default: 'email', required: true },
    avatar: { type: String, default: '' },
    isPremium: { type: Boolean, default: false },
    themeColor: { type: String, default: 'purple' },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: null },
    otpExpires: { type: Date, default: null },

    notificationPrefs: {
  dailyReminder: { type: Boolean, default: false },
  reminderTime: { type: String, default: '20:00' },
  reminderMethod: { type: String, enum: ['email', 'sms'], default: 'email' },
  emailDigest: { type: String, default: 'off' },
  weeklyDigest: { type: Boolean, default: false },
  monthlyDigest: { type: Boolean, default: false },
},

    aiReflectionEnabled: { type: Boolean, default: false },
    pushSubscription: { type: mongoose.Schema.Types.Mixed, default: null },
    promptCategories: { type: [String], default: ['gratitude', 'reflection', 'goals'] },
    currentTheme: { type: mongoose.Schema.Types.ObjectId, ref: 'Theme', default: null },
    customThemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Theme' }],

    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre('validate', function (next) {
  if (!this.email && !this.phone) {
    return next(new Error('Either email or phone is required'));
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Must call next() here!
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.logActivity = function (action) {
  this.activityLog.push({ action, timestamp: new Date() });
  if (this.activityLog.length > 30) {
    this.activityLog = this.activityLog.slice(-30);
  }
};

module.exports = mongoose.model('User', userSchema);