const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, detail = '') => {
  try {
    await ActivityLog.create({ user: userId, action, detail });
  } catch (err) {
    // Never let logging failures break the main request
    console.error('Activity log failed:', err.message);
  }
};

module.exports = { logActivity };
