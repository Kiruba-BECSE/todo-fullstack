
const express = require('express');
const router = express.Router();

const Todo = require('../models/Todo');
const TodoList = require('../models/TodoList');
const auth = require('../middleware/auth');

// Helper: confirm the list belongs to the logged-in user
async function verifyListOwnership(listId, userId) {
  const list = await TodoList.findOne({
    _id: listId,
    owner: userId
  });

  return list;
}


// CREATE a todo item inside a list
// POST /api/todos/:listId
router.post('/:listId', auth, async (req, res) => {
  try {
    const list = await verifyListOwnership(
      req.params.listId,
      req.userId
    );

    if (!list) {
      return res.status(404).json({
        error: 'List not found'
      });
    }

    const todo = new Todo({
      title: req.body.title,
      tags: req.body.tags || [],
      list: req.params.listId,

      // Reminder date and time
      reminderAt: req.body.reminderAt || null
    });

    await todo.save();

    res.status(201).json(todo);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});


// GET all todos in a list
// GET /api/todos/:listId?tag=urgent
router.get('/:listId', auth, async (req, res) => {
  const list = await verifyListOwnership(
    req.params.listId,
    req.userId
  );

  if (!list) {
    return res.status(404).json({
      error: 'List not found'
    });
  }

  const filter = {
    list: req.params.listId
  };

  // Filter by tag if provided
  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  const todos = await Todo
    .find(filter)
    .sort({
      order: 1,
      createdAt: -1
    });

  res.json(todos);
});


// UPDATE a todo item
// Supports title, completed, tags and reminderAt
// PUT /api/todos/item/:id
router.put('/item/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(
      req.params.id
    );

    if (!todo) {
      return res.status(404).json({
        error: 'Not found'
      });
    }

    // Make sure the list belongs to the user
    const list = await verifyListOwnership(
      todo.list,
      req.userId
    );

    if (!list) {
      return res.status(403).json({
        error: 'Not authorized'
      });
    }

    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true
      }
    );

    res.json(updated);

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});


// DELETE a todo item
// DELETE /api/todos/item/:id
router.delete('/item/:id', auth, async (req, res) => {
  const todo = await Todo.findById(
    req.params.id
  );

  if (!todo) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  const list = await verifyListOwnership(
    todo.list,
    req.userId
  );

  if (!list) {
    return res.status(403).json({
      error: 'Not authorized'
    });
  }

  await Todo.findByIdAndDelete(
    req.params.id
  );

  res.json({
    message: 'Deleted'
  });
});


// PUBLIC: View a shared list by shareId
// No login required
// GET /api/todos/public/:shareId
router.get('/public/:shareId', async (req, res) => {
  const list = await TodoList.findOne({
    shareId: req.params.shareId,
    isPublic: true
  });

  if (!list) {
    return res.status(404).json({
      error: 'This list is not public or does not exist'
    });
  }

  const todos = await Todo
    .find({
      list: list._id
    })
    .sort({
      order: 1,
      createdAt: -1
    });

  res.json({
    title: list.title,
    isPublic: list.isPublic,
    todos
  });
});


// REORDER todos within a list
// PUT /api/todos/reorder/:listId
router.put('/reorder/:listId', auth, async (req, res) => {
  try {
    const list = await verifyListOwnership(
      req.params.listId,
      req.userId
    );

    if (!list) {
      return res.status(404).json({
        error: 'List not found'
      });
    }

    const { orderedIds } = req.body;

    const updates = orderedIds.map(
      (id, index) =>
        Todo.findByIdAndUpdate(
          id,
          {
            order: index
          }
        )
    );

    await Promise.all(updates);

    res.json({
      message: 'Order updated'
    });

  } catch (err) {
    res.status(400).json({
      error: err.message
    });
  }
});


module.exports = router;
