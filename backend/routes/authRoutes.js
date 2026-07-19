const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/vapid-public-key', getVapidPublicKey);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);
router.put('/password', protect, changePassword);
router.get('/activity', protect, getActivityLog);
router.delete('/account', protect, deleteAccount);
router.post('/push-subscribe', protect, savePushSubscription);
router.delete('/push-subscribe', protect, removePushSubscription);
router.post('/push-test', protect, sendTestPush);

module.exports = router;
