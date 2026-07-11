const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  tags: [{ type: String }],
  list: { type: mongoose.Schema.Types.ObjectId, ref: 'TodoList', required: true },
  order: { type: Number, default: 0 },
  reminderAt: { type: Date, default: null },
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Todo', todoSchema);