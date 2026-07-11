const mongoose = require('mongoose');
const crypto = require('crypto');

const todoListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  shareId: { type: String, unique: true, default: () => crypto.randomBytes(8).toString('hex') }
}, { timestamps: true });

module.exports = mongoose.model('TodoList', todoListSchema);