const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendReminderEmail(toEmail, todoTitle, listTitle) {
  await transporter.sendMail({
    from: `"Fieldnotes" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Reminder: ${todoTitle}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>⏰ Task Reminder</h2>
        <p>This is a reminder for a task in your list <strong>${listTitle}</strong>:</p>
        <p style="font-size: 18px; padding: 12px; background: #f0f2f5; border-radius: 8px;">${todoTitle}</p>
      </div>
    `
  });
}
async function sendResetCodeEmail(toEmail, code) {
  await transporter.sendMail({
    from: `"Momentum" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Your password reset code: ${code}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>Reset your password</h2>
        <p>Use this code to reset your Momentum password:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px; background: #f0f2f5; border-radius: 8px; text-align: center;">${code}</p>
        <p style="color: #888; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `
  });
}

module.exports = { sendReminderEmail, sendResetCodeEmail };

