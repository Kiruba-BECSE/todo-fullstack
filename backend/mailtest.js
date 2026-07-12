require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing with:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'MISSING');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  family: 4
});

transporter.verify((err, success) => {
  if (err) {
    console.log('CONNECTION FAILED:', err.message);
  } else {
    console.log('Server is ready to send emails ✅');

    transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Test email from Momentum',
      text: 'If you got this, Gmail SMTP is working!'
    }, (err, info) => {
      if (err) {
        console.log('SEND FAILED:', err.message);
      } else {
        console.log('EMAIL SENT SUCCESSFULLY:', info.response);
      }
    });
  }
});