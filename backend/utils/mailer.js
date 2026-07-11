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

module.exports = sendReminderEmail;