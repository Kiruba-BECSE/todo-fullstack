const cron = require('node-cron');
const Todo = require('../models/Todo');
const TodoList = require('../models/TodoList');
const User = require('../models/User');
const { sendReminderEmail } = require('../utils/mailer');

function startReminderJob() {
  // runs every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    // find todos with a reminder time that's already passed, not sent yet, and not completed
    const dueTodos = await Todo.find({
      reminderAt: { $lte: now },
      reminderSent: false,
      completed: false
    });

    for (const todo of dueTodos) {
      try {
        const list = await TodoList.findById(todo.list);
        if (!list) continue;

        const user = await User.findById(list.owner);
        if (!user) continue;

        await sendReminderEmail(user.email, todo.title, list.title);

        todo.reminderSent = true;
        await todo.save();

        console.log(`Reminder sent for "${todo.title}" to ${user.email}`);
      } catch (err) {
        console.error('Failed to send reminder:', err.message);
      }
    }
  });
}

module.exports = startReminderJob;