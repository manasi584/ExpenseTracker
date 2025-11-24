const express = require('express');
const MonthlySummary = require('../models/MonthlySummary');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const EnvelopeAllocation = require('../models/EnvelopeAllocation');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

const FIXED_CATEGORIES = ['Groceries', 'Transportation', 'Utilities', 'Dining Out', 'Entertainment', 'Other'];

// GET /api/summary/current - Get current month summary or check if month-end
router.get('/current', async (req, res) => {
  try {
    const user = await User.findOne({ name: 'user2' });
    if (!user) return res.json({ isMonthEnd: false });

    const budget = await Budget.findOne({ userId: user._id });
    if (!budget) return res.json({ isMonthEnd: false });

    const now = new Date();
    const isLastDayOfMonth = now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    if (isLastDayOfMonth) {
      // Generate month-end summary
      const expenses = await Expense.find({ budgetId: budget._id });
      const totalSpent = expenses.filter(e => e.amount > 0).reduce((sum, e) => sum + e.amount, 0);
      const totalIncome = Math.abs(expenses.filter(e => e.amount < 0).reduce((sum, e) => sum + e.amount, 0));
      
      // Category breakdown
      const categoryBreakdown = await Promise.all(
        FIXED_CATEGORIES.map(async (category) => {
          const categoryExpenses = expenses.filter(e => e.category === category && e.amount > 0);
          const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
          const allocation = await EnvelopeAllocation.findOne({ budgetId: budget._id, category });
          
          return {
            category,
            allocated: allocation ? allocation.allocated : 0,
            spent
          };
        })
      );

      const summary = {
        isMonthEnd: true,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        totalBudget: budget.budget,
        totalSpent,
        totalIncome,
        categoryBreakdown
      };

      res.json(summary);
    } else {
      res.json({ isMonthEnd: false });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to get current summary' });
  }
});

// POST /api/summary/save - Save month-end summary and reset
router.post('/save', async (req, res) => {
  try {
    const { month, year, totalBudget, totalSpent, totalIncome, categoryBreakdown } = req.body;
    
    const user = await User.findOne({ name: 'user2' });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const budget = await Budget.findOne({ userId: user._id });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });

    // Save summary
    await MonthlySummary.create({
      month, year, totalBudget, totalSpent, totalIncome, categoryBreakdown, budgetId: budget._id
    });

    // Reset budget spent amount
    await Budget.findByIdAndUpdate(budget._id, { spent: 0 });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save summary' });
  }
});

// GET /api/summary/history - Get monthly summaries
router.get('/history', async (req, res) => {
  try {
    const user = await User.findOne({ name: 'user2' });
    if (!user) return res.json([]);

    const budget = await Budget.findOne({ userId: user._id });
    if (!budget) return res.json([]);

    const summaries = await MonthlySummary.find({ budgetId: budget._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
});

module.exports = router;