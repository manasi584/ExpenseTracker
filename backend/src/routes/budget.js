const express = require('express');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name: 'John Doe', email: 'johndoe@example.com', budget: 20000, cards: 1, passcode: '123456' });
    }
    
    let budget = await Budget.findOne({ userId: user._id });
    if (!budget) {
      budget = await Budget.create({ budget: 20000, spent: 0, userId: user._id });
    }
    
    // Calculate actual spent from expenses for this budget
    const expenses = await Expense.find({ budgetId: budget._id, amount: { $gt: 0 } });
    const actualSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    res.json({ budget: budget.budget, spent: actualSpent, _id: budget._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// PUT /api/budget
router.put('/', async (req, res) => {
  try {
    const { budget, spent } = req.body;
    let user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let budgetDoc = await Budget.findOne({ userId: user._id });
    if (!budgetDoc) {
      budgetDoc = await Budget.create({ budget: budget || 20000, spent: spent || 0, userId: user._id });
    } else {
      if (typeof budget !== 'undefined') budgetDoc.budget = budget;
      if (typeof spent !== 'undefined') budgetDoc.spent = spent;
      await budgetDoc.save();
    }
    res.json(budgetDoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

module.exports = router;