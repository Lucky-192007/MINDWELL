const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const { generateOtp, sendOtpEmail } = require('../utils/email');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// @route POST /api/auth/register
// Creates the account as unverified and emails a 6-digit OTP.
// No JWT is issued yet - that happens after verifyOtp succeeds.
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const otp = generateOtp();
    const user = await User.create({
      name,
      email,
      password,
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    try {
      await sendOtpEmail(email, name, otp);
    } catch (emailErr) {
      console.error('Failed to send OTP email:', emailErr.message);
      // Don't block registration if email sending fails in dev - the OTP is still on the record.
      // In production you'd want stricter handling here.
    }

    res.status(201).json({
      message: 'Verification code sent to your email',
      email: user.email,
      requiresOtp: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });
    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    }
    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Incorrect code' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.logActivity('Verified account via email OTP');
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      avatar: user.avatar,
      themeColor: user.themeColor,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Account already verified' });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, user.name, otp);
    res.json({ message: 'A new code has been sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first', requiresOtp: true, email: user.email });
    }

    user.logActivity('Logged in');
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium,
      avatar: user.avatar,
      themeColor: user.themeColor,
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar, themeColor } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name !== undefined) user.name = name;
    if (themeColor !== undefined) user.themeColor = themeColor;
    if (avatar !== undefined) {
      if (avatar.length > 4_000_000) {
        return res.status(400).json({ message: 'Image is too large. Please choose a smaller photo.' });
      }
      user.avatar = avatar;
      user.logActivity('Updated profile photo');
    }
    if (name !== undefined) user.logActivity('Updated profile name');

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PUT /api/auth/preferences
const updatePreferences = async (req, res) => {
  try {
    const { dailyReminder, reminderTime, promptCategories, weeklyDigest, monthlyDigest, aiReflectionEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (dailyReminder !== undefined) user.notificationPrefs.dailyReminder = dailyReminder;
    if (reminderTime !== undefined) user.notificationPrefs.reminderTime = reminderTime;
    if (weeklyDigest !== undefined) user.notificationPrefs.weeklyDigest = weeklyDigest;
    if (monthlyDigest !== undefined) user.notificationPrefs.monthlyDigest = monthlyDigest;
    if (promptCategories !== undefined) user.promptCategories = promptCategories;
    if (aiReflectionEnabled !== undefined) user.aiReflectionEnabled = aiReflectionEnabled;

    user.logActivity('Updated preferences');
    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route PUT /api/auth/password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    const matches = await user.matchPassword(currentPassword);
    if (!matches) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    user.logActivity('Changed password');
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route GET /api/auth/activity
const getActivityLog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('activityLog');
    res.json(user.activityLog);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/auth/account
const deleteAccount = async (req, res) => {
  try {
    await JournalEntry.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account and all journal data deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/forgot-password
// Sends a reset code to the user's email (reuses the same OTP fields on the model)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond success even if not found, to avoid leaking which emails are registered
    if (!user) return res.json({ message: 'If that email exists, a reset code has been sent.' });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(email, user.name, otp);
    res.json({ message: 'If that email exists, a reset code has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    }
    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Incorrect code' });
    }

    user.password = newPassword;
    user.otpCode = null;
    user.otpExpires = null;
    user.logActivity('Reset password via email code');
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/push-subscribe
const savePushSubscription = async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) return res.status(400).json({ message: 'Subscription payload required' });
    const user = await User.findById(req.user._id);
    user.pushSubscription = subscription;
    await user.save();
    res.json({ message: 'Push notifications enabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route DELETE /api/auth/push-subscribe
const removePushSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.pushSubscription = null;
    await user.save();
    res.json({ message: 'Push notifications disabled' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @route POST /api/auth/push-test
const sendTestPush = async (req, res) => {
  try {
    const { sendPush } = require('../utils/push');
    const user = await User.findById(req.user._id);
    if (!user.pushSubscription) {
      return res.status(400).json({ message: 'No push subscription on file. Enable notifications first.' });
    }
    await sendPush(user.pushSubscription, {
      title: 'MindWell',
      body: "This is a test notification. Your reminders will look like this.",
    });
    res.json({ message: 'Test notification sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to send notification' });
  }
};

// @route GET /api/auth/vapid-public-key
const getVapidPublicKey = (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY || null });
};

module.exports = {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
  getActivityLog,
  deleteAccount,
  forgotPassword,
  resetPassword,
  savePushSubscription,
  removePushSubscription,
  sendTestPush,
  getVapidPublicKey,
};
