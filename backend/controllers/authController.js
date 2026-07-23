const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOtp, sendOtpEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');
const { sendPush } = require('../utils/push');

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validate input
    if (!name || !password) {
      return res.status(400).json({ message: 'Name and password required' });
    }

    if (!email && !phone) {
      return res.status(400).json({ message: 'Email or phone number required' });
    }

    // Check if email exists
    if (email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if phone exists
    if (phone) {
      const exists = await User.findOne({ phone });
      if (exists) return res.status(400).json({ message: 'Phone already registered' });
    }

    const loginMethod = email ? 'email' : 'phone';
    const otp = generateOtp();

    // Build user data object dynamically so empty fields are omitted entirely (no nulls stored)
    const userData = {
      name,
      password,
      loginMethod,
      isPremium: false,
      isVerified: false,
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
    };

    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const user = new User(userData);
    await user.save();

    // Send OTP asynchronously
    if (email) {
      sendOtpEmail(email, name, otp).catch(err => console.error('Email send error:', err.message));
    } else if (phone) {
      sendSMS(phone, `Your MindWell verification code is: ${otp}`).catch(err => console.error('SMS send error:', err.message));
    }

    res.status(201).json({
      message: `Verification code sent to your ${loginMethod}`,
      pendingOtpEmail: email || phone,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { emailOrPhone, otp } = req.body;
    if (!emailOrPhone || !otp) {
      return res.status(400).json({ message: 'Email/phone and OTP required' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }
    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP' });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    user.logActivity('Verified email/phone via OTP');
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (user.email) {
      sendOtpEmail(user.email, user.name, otp).catch(() => {});
    } else if (user.phone) {
      sendSMS(user.phone, `Your MindWell verification code is: ${otp}`).catch(() => {});
    }

    res.json({ message: 'Verification code resent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ message: 'Email/phone and password required' });
    }

    // Find user by email OR phone
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    // Check if verified
    if (!user.isVerified) {
      const otp = generateOtp();
      user.otpCode = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();

      // Send OTP
      if (user.email) {
        sendOtpEmail(user.email, user.name, otp).catch(err => console.error('Email failed:', err));
      } else if (user.phone) {
        const { sendSMS } = require('../utils/sms');
        sendSMS(user.phone, `Your MindWell verification code is: ${otp}`).catch(err => console.error('SMS failed:', err));
      }

      return res.status(400).json({
        requiresOtp: true,
        pendingOtpEmail: user.email || user.phone,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email/phone or password' });
    }

    user.logActivity('Logged in');
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('currentTheme').select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, themeColor } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, themeColor },
      { new: true }
    ).select('-password');
    user.logActivity('Updated profile');
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { dailyReminder, reminderTime, reminderMethod, promptCategories, weeklyDigest, monthlyDigest, aiReflectionEnabled } = req.body;
    
    const user = await User.findById(req.user._id);

    // SMS reminders only for PRO users
    let finalReminderMethod = reminderMethod || user.notificationPrefs.reminderMethod;
    if (finalReminderMethod === 'sms' && !user.isPremium) {
      finalReminderMethod = 'email'; // Force email for non-pro users
    }

    user.notificationPrefs = {
      dailyReminder: dailyReminder !== undefined ? dailyReminder : user.notificationPrefs.dailyReminder,
      reminderTime: reminderTime || user.notificationPrefs.reminderTime,
      reminderMethod: finalReminderMethod,
      emailDigest: user.notificationPrefs.emailDigest,
      weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : user.notificationPrefs.weeklyDigest,
      monthlyDigest: monthlyDigest !== undefined ? monthlyDigest : user.notificationPrefs.monthlyDigest,
    };

    if (promptCategories) user.promptCategories = promptCategories;
    if (aiReflectionEnabled !== undefined) user.aiReflectionEnabled = aiReflectionEnabled;

    user.logActivity('Updated preferences');
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

    user.password = newPassword;
    user.logActivity('Changed password');
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getActivityLog = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('activityLog');
    res.json(user.activityLog.slice(-30));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const JournalEntry = require('../models/JournalEntry');
    await JournalEntry.deleteMany({ user: req.user._id });
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
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

const sendTestPush = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.pushSubscription) {
      return res.status(400).json({ message: 'No push subscription on file. Enable notifications first.' });
    }
    await sendPush(user.pushSubscription, {
      title: 'MindWell',
      body: 'This is a test notification. Your reminders will look like this.',
    });
    res.json({ message: 'Test notification sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Failed to send notification' });
  }
};

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