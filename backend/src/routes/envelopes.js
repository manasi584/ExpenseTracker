const express = require('express');
const Envelope = require('../models/Envelope');
const EnvelopeAllocation = require('../models/EnvelopeAllocation');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

const FIXED_CATEGORIES = ['Groceries', 'Transportation', 'Utilities', 'Dining Out', 'Entertainment', 'Other'];

// GET /api/envelopes - Get all envelopes with spent amounts
router.get('/', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.json([]);
    }
    const budget = await Budget.findOne({ userId: user._id });
    if (!budget) {
      return res.json([]);
    }

    const envelopes = await Envelope.find({ userId: user._id });
    
    // Calculate spent amount for each envelope by filtering expenses by category
    const envelopesWithSpent = await Promise.all(
      envelopes.map(async (envelope) => {
        const expenses = await Expense.find({ 
          budgetId: budget._id, 
          category: envelope.name,
          amount: { $gt: 0 } // Only positive amounts (expenses, not income)
        });
        
        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        return {
          id: envelope._id,
          name: envelope.name,
          allocated: envelope.allocated,
          spent: spent
        };
      })
    );

    res.json(envelopesWithSpent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch envelopes' });
  }
});

// POST /api/envelopes - Create new envelope
router.post('/', async (req, res) => {
  try {
    const { name, allocated } = req.body;
    if (!name || typeof allocated === 'undefined') {
      return res.status(400).json({ error: 'name and allocated are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const envelope = await Envelope.create({ name, allocated, userId: user._id });
    res.status(201).json({
      id: envelope._id,
      name: envelope.name,
      allocated: envelope.allocated,
      spent: 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create envelope' });
  }
});

// GET /api/envelopes/fixed - Get fixed categories with spent amounts
router.get('/fixed', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      const defaultEnvelopes = FIXED_CATEGORIES.map(cat => ({
        id: cat.toLowerCase(),
        name: cat,
        allocated: 0,
        spent: 0
      }));
      return res.json(defaultEnvelopes);
    }
    const budget = await Budget.findOne({ userId: user._id });
    if (!budget) {
      const defaultEnvelopes = FIXED_CATEGORIES.map(cat => ({
        id: cat.toLowerCase(),
        name: cat,
        allocated: 0,
        spent: 0
      }));
      return res.json(defaultEnvelopes);
    }

    // Calculate spent amount for each fixed category
    const envelopesWithSpent = await Promise.all(
      FIXED_CATEGORIES.map(async (categoryName) => {
        const expenses = await Expense.find({ 
          budgetId: budget._id, 
          category: categoryName,
          amount: { $gt: 0 } // Only positive amounts (expenses, not income)
        });
        
        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Get allocation for this category
        const allocation = await EnvelopeAllocation.findOne({ 
          budgetId: budget._id, 
          category: categoryName 
        });
        
        return {
          id: categoryName.toLowerCase(),
          name: categoryName,
          allocated: allocation ? allocation.allocated : 0,
          spent: spent
        };
      })
    );

    res.json(envelopesWithSpent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch envelope data' });
  }
});

// PUT /api/envelopes/allocation - Update allocation for a category
router.put('/allocation', async (req, res) => {
  try {
    const { category, allocated } = req.body;
    if (!category || typeof allocated === 'undefined') {
      return res.status(400).json({ error: 'category and allocated are required' });
    }
    
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const budget = await Budget.findOne({ userId: user._id });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    // Update or create allocation
    const allocation = await EnvelopeAllocation.findOneAndUpdate(
      { budgetId: budget._id, category },
      { allocated: parseFloat(allocated) },
      { upsert: true, new: true }
    );
    
    res.json({ success: true, allocation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update allocation' });
  }
});

module.exports = router;