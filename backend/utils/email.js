const { Resend } = require('resend');

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpEmail = async (email, name, otp) => {
  try {
    const data = await resend.emails.send({
      from: 'MindWell <onboarding@resend.dev>', // Use your verified domain later, or Resend's test domain for now
      to: [email],
      subject: 'Your MindWell Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Welcome to MindWell, ${name}!</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #6366f1; letter-spacing: 2px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    });
    return data;
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
};

module.exports = { generateOtp, sendOtpEmail };