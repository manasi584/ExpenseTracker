const express = require('express');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

// GET /api/user
router.get('/', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = await User.create({ name: 'John Doe', email: 'johndoe@example.com', budget: 20000, cards: 1, passcode: '123456' });
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

module.exports = router;