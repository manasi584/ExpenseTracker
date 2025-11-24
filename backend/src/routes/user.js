const express = require('express');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

// GET /api/user
router.get('/', async (req, res) => {
  try {
    // For now, look for user2 since that's who logged in
    let user = await User.findOne({ name: 'user2' });
    if (!user) {
      // If user2 doesn't exist, create it
      user = await User.create({ name: 'user2', email: 'user2@example.com', budget: 20000, cards: 1, passcode: '123456' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// POST /api/user/validate-passcode
router.post('/validate-passcode', async (req, res) => {
  try {
    const { passcode } = req.body;
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isValid = user.passcode === passcode;
    res.json({ valid: isValid });
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate passcode' });
  }
});

// POST /api/user/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, passcode } = req.body;
    if (!name || !email || !passcode) {
      return res.status(400).json({ error: 'Name, email and passcode are required' });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = await User.create({ name, email, passcode, budget: 20000, cards: 1 });
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

module.exports = router;