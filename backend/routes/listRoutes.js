const express = require('express');
const router = express.Router();
const TodoList = require('../models/TodoList');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// CREATE a list (protected)
router.post('/', auth, async (req, res) => {
  try {
    const list = new TodoList({ title: req.body.title, owner: req.userId });
    await list.save();
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all lists belonging to logged-in user
router.get('/', auth, async (req, res) => {
  const lists = await TodoList.find({ owner: req.userId }).sort({ createdAt: -1 });
  res.json(lists);
});

// GET one list (only if owned by user)
router.get('/:id', auth, async (req, res) => {
  const list = await TodoList.findOne({ _id: req.params.id, owner: req.userId });
  if (!list) return res.status(404).json({ error: 'Not found' });
  res.json(list);
});

// RENAME a list
router.put('/:id', auth, async (req, res) => {
  const list = await TodoList.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    { title: req.body.title, isPublic: req.body.isPublic },
    { new: true }
  );
  if (!list) return res.status(404).json({ error: 'Not found' });
  res.json(list);
});

// DELETE a list (and its todo items)
router.delete('/:id', auth, async (req, res) => {
  const list = await TodoList.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!list) return res.status(404).json({ error: 'Not found' });

  // also delete all todos that belonged to this list
  await Todo.deleteMany({ list: req.params.id });

  res.json({ message: 'List and its todos deleted' });
});

module.exports = router;