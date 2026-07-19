const webpush = require('web-push');

// VAPID keys identify this server to push services (Chrome/Firefox push infra).
// Generate a pair once with: npx web-push generate-vapid-keys
// Put the output in backend/.env as VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:support@mindwell.local',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const sendPush = async (subscription, payload) => {
  if (!process.env.VAPID_PUBLIC_KEY) {
    throw new Error('Push notifications are not configured on this server (missing VAPID keys).');
  }
  return webpush.sendNotification(subscription, JSON.stringify(payload));
};

module.exports = { sendPush };
