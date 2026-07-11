const express = require('express');
const router = express.Router();

const TodoList = require('../models/TodoList');
const Todo = require('../models/Todo');
const auth = require('../middleware/auth');

// CREATE a list (protected)
router.post('/', auth, async (req, res) => {
  try {
    const list = new TodoList({
      title: req.body.title,
      owner: req.userId
    });

    await list.save()
    res.status(201).json(list);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all lists belonging to logged-in user
router.get('/', auth, async (req, res) => {
  const lists = await TodoList.find({
    owner: req.userId
  }).sort({ createdAt: -1 });

  res.json(lists);
});


// PUBLIC ROUTE
// IMPORTANT: Must come BEFORE /:id
router.get('/public/:shareId', async (req, res) => {
  try {
    const list = await TodoList.findOne({
      shareId: req.params.shareId,
      isPublic: true
    });

    if (!list) {
      return res.status(404).json({
        error: 'Public list not found'
      });
    }

    const todos = await Todo.find({
      list: list._id
    });

    res.json({
      list,
      todos
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// GET one list (only if owned by user)
router.get('/:id', auth, async (req, res) => {
  const list = await TodoList.findOne({
    _id: req.params.id,
    owner: req.userId
  });

  if (!list) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(list);
});

// RENAME a list
router.put('/:id', auth, async (req, res) => {
  const list = await TodoList.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.userId
    },
    {
      title: req.body.title,
      isPublic: req.body.isPublic
    },
    { new: true }
  );

  if (!list) {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json(list);
});

// DELETE a list and its todos
router.delete('/:id', auth, async (req, res) => {
  const list = await TodoList.findOneAndDelete({
    _id: req.params.id,
    owner: req.userId
  });

  if (!list) {
    return res.status(404).json({ error: 'Not found' });
  }

  await Todo.deleteMany({
    list: req.params.id
  });

  res.json({
    message: 'List and its todos deleted'
  });
});


// GET stats for a list
router.get('/:id/stats', auth, async (req, res) => {
  const list = await TodoList.findOne({
    _id: req.params.id,
    owner: req.userId
  });

  if (!list) {
    return res.status(404).json({
      error: 'List not found'
    });
  }

  const todos = await Todo.find({
    list: req.params.id
  });

  const total = todos.length;

  const completed = todos.filter(
    todo => todo.completed
  ).length;

  const pending = total - completed;

  const tagCounts = {};

  todos.forEach(todo => {
    if (todo.tags.length === 0) {
      tagCounts['no tag'] =
        (tagCounts['no tag'] || 0) + 1;
    } else {
      todo.tags.forEach(tag => {
        tagCounts[tag] =
          (tagCounts[tag] || 0) + 1;
      });
    }
  });

  res.json({
    total,
    completed,
    pending,
    tagCounts
  });
});

module.exports = router;
