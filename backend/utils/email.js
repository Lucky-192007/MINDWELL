const nodemailer = require('nodemailer');

// Uses a Gmail account + App Password (not your regular Gmail password).
// Set EMAIL_USER and EMAIL_PASS in backend/.env
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000)); // 6-digit code

const sendOtpEmail = async (toEmail, name, otp) => {
  await transporter.sendMail({
    from: `"MindWell" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your MindWell verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color: #6C5CE7;">Verify your MindWell account</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Your verification code is:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1E1B33;">${otp}</p>
        <p style="color: #8B889C; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { generateOtp, sendOtpEmail };
