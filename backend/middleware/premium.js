// Gates routes that require a premium subscription (advanced analytics, unlimited history search)
const requirePremium = (req, res, next) => {
  if (!req.user || !req.user.isPremium) {
    return res.status(403).json({
      message: 'This feature requires MindWell Premium.',
      upgradeRequired: true,
    });
  }
  next();
};

module.exports = { requirePremium };
