const express = require('express');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();

// Apply request logger to all routes
router.use(requestLogger);

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const list = await Expense.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { title, category, amount } = req.body;
    if (!title || !category || typeof amount === 'undefined') {
      return res.status(400).json({ error: 'title, category and amount are required' });
    }
    const expense = await Expense.create({ title, category, amount });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// GET /api/expenses/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Expense.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const updates = (({ title, category, amount }) => ({ title, category, amount }))(req.body);
    const item = await Expense.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await Expense.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
