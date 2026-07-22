const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (toPhone, message) => {
  if (!process.env.TWILIO_PHONE_NUMBER) {
    throw new Error('SMS not configured (missing TWILIO keys)');
  }
  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhone,
    });
    return true;
  } catch (error) {
    console.error('SMS error:', error.message);
    throw error;
  }
};

module.exports = { sendSMS };
