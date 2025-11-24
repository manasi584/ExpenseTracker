const express = require('express');
const Budget = require('../models/Budget');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    let budget = await Budget.findOne();
    if (!budget) {
      budget = await Budget.create({ budget: 20000, spent: 0 });
    }
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// PUT /api/budget
router.put('/', async (req, res) => {
  try {
    const { budget, spent } = req.body;
    let budgetDoc = await Budget.findOne();
    if (!budgetDoc) {
      budgetDoc = await Budget.create({ budget: budget || 20000, spent: spent || 0 });
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