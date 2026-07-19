const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true, // Use connection pooling for speed
  maxConnections: 5,
  maxMessages: 100,
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (toEmail, name, otp) => {
  try {
    await transporter.sendMail({
      from: `"MindWell" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Your MindWell verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
          <h2 style="color: #6C5CE7;">Verify your email</h2>
          <p>Hi ${name},</p>
          <p>Use this code to finish creating your MindWell account:</p>
          <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1E1B33; text-align: center;">${otp}</p>
          <p style="color: #8B889C; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
      priority: 'high', // Send faster
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

module.exports = { generateOtp, sendOtpEmail };