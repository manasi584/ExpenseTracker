const express = require('express');
const Investment = require('../models/Investment');
const RecurringInvestment = require('../models/RecurringInvestment');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');
const { calculateInvestmentProfit } = require('../../constants/stockPrices');

const router = express.Router();
router.use(requestLogger);

// GET /api/investments
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json([]);
    }
    const investments = await Investment.find({ userId: user._id });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// POST /api/investments
router.post('/', async (req, res) => {
  try {
    const { name, value, investmentType } = req.body;
    if (!name || typeof value === 'undefined') {
      return res.status(400).json({ error: 'name and value are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const investment = await Investment.create({ 
      name, 
      value, 
      investmentType: investmentType || 'Index Fund',
      userId: user._id 
    });
    res.status(201).json(investment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create investment' });
  }
});

// POST /api/investments/recurring
router.post('/recurring', async (req, res) => {
  try {
    const { amount, frequency, startDate, endDate, investmentType, currency } = req.body;
    
    if (!amount || !startDate || !investmentType) {
      return res.status(400).json({ error: 'amount, startDate, and investmentType are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const recurringInvestment = await RecurringInvestment.create({
      amount,
      frequency: frequency || 'monthly',
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      investmentType,
      currency: currency || 'INR',
      userId: user._id
    });
    
    res.status(201).json(recurringInvestment);
  } catch (err) {
    console.error('Error creating recurring investment:', err);
    res.status(500).json({ error: 'Failed to create recurring investment' });
  }
});

// GET /api/investments/recurring
router.get('/recurring', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json([]);
    }
    const recurringInvestments = await RecurringInvestment.find({ userId: user._id });
    res.json(recurringInvestments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recurring investments' });
  }
});

// GET /api/investments/chart - Investment chart data for last 6 months
router.get('/chart', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json([]);
    }
    
    const budget = await Budget.findOne({ userId: user._id });
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const [investments, recurringInvestments, investmentExpenses] = await Promise.all([
      Investment.find({ 
        userId: user._id, 
        createdAt: { $gte: sixMonthsAgo } 
      }).sort({ createdAt: 1 }),
      RecurringInvestment.find({ 
        userId: user._id,
        startDate: { $gte: sixMonthsAgo }
      }).sort({ startDate: 1 }),
      budget ? Expense.find({
        budgetId: budget._id,
        category: 'Investment',
        amount: { $lt: 0 }, // Negative amounts are investments
        createdAt: { $gte: sixMonthsAgo }
      }).sort({ createdAt: 1 }) : []
    ]);
    
    // Get month names for last 6 months
    const months = [];
    const monthlyData = {};
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
      months.push({ key: monthKey, label: monthLabel });
      monthlyData[monthKey] = 0;
    }
    
    // Aggregate investment amounts by month
    investments.forEach(inv => {
      const monthKey = inv.createdAt.toISOString().slice(0, 7);
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += inv.value;
      }
    });
    
    recurringInvestments.forEach(recurring => {
      const monthKey = recurring.startDate.toISOString().slice(0, 7);
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += recurring.amount;
      }
    });
    
    // Add investment expenses (convert negative amounts to positive)
    investmentExpenses.forEach(expense => {
      const monthKey = expense.createdAt.toISOString().slice(0, 7);
      if (monthlyData.hasOwnProperty(monthKey)) {
        monthlyData[monthKey] += Math.abs(expense.amount);
      }
    });
    
    // Format data for chart
    const chartData = months.map(month => ({
      value: monthlyData[month.key],
      label: month.label
    }));
    
    res.json(chartData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch investment chart data' });
  }
});

// GET /api/investments/recent - Combined recent investments
router.get('/recent', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json([]);
    }
    
    const [investments, recurringInvestments] = await Promise.all([
      Investment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
      RecurringInvestment.find({ userId: user._id }).sort({ createdAt: -1 })
    ]);
    
    const recentInvestments = [];
    
    // Add regular investments
    investments.forEach(inv => {
      const daysHeld = Math.floor((new Date() - inv.createdAt) / (1000 * 60 * 60 * 24));
      const profit = calculateInvestmentProfit(inv.value, inv.investmentType || inv.name, daysHeld);
      
      recentInvestments.push({
        id: inv._id,
        name: inv.name,
        amount: inv.value,
        date: inv.createdAt.toISOString().split('T')[0],
        profit: Math.round(profit),
        type: inv.investmentType || 'Index Fund'
      });
    });
    
    // Add recurring investments
    recurringInvestments.forEach(recurring => {
      const daysHeld = Math.floor((new Date() - recurring.startDate) / (1000 * 60 * 60 * 24));
      const profit = calculateInvestmentProfit(recurring.amount, recurring.investmentType, daysHeld);
      
      recentInvestments.push({
        id: `recurring-${recurring._id}`,
        name: `${recurring.investmentType} (Auto)`,
        amount: recurring.amount,
        date: recurring.startDate.toISOString().split('T')[0],
        profit: Math.round(profit),
        type: recurring.investmentType
      });
    });
    
    // Sort by date (newest first)
    recentInvestments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(recentInvestments.slice(0, 10));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent investments' });
  }
});

module.exports = router;