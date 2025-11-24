const express = require('express');
const Investment = require('../models/Investment');
const RecurringInvestment = require('../models/RecurringInvestment');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

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
    const { name, value } = req.body;
    if (!name || typeof value === 'undefined') {
      return res.status(400).json({ error: 'name and value are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const investment = await Investment.create({ name, value, userId: user._id });
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

module.exports = router;