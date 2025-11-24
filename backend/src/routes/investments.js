const express = require('express');
const Investment = require('../models/Investment');
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

module.exports = router;