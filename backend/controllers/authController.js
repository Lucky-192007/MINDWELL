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
    const { dailyReminder, reminderTime, promptCategories } = req.body;
    const user = await User.findById(req.user._id);

    if (dailyReminder !== undefined) user.notificationPrefs.dailyReminder = dailyReminder;
    if (reminderTime !== undefined) user.notificationPrefs.reminderTime = reminderTime;
    if (promptCategories !== undefined) user.promptCategories = promptCategories;

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
};
