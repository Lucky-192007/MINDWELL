const nodemailer = require('nodemailer');

// Requires EMAIL_USER and EMAIL_PASS in .env
// EMAIL_PASS must be a Gmail "App Password" (not your normal Gmail password) -
// generate one at https://myaccount.google.com/apppasswords (requires 2-Step Verification
// to be enabled on the Gmail account first)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"MindWell" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your MindWell verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color: #6C5CE7;">Verify your email</h2>
        <p>Use this code to finish creating your MindWell account:</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1E1B33;">${otp}</p>
        <p style="color: #8B889C; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };
