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
      user = await User.create({ name: 'John Doe', email: 'johndoe@example.com', budget: 20000, cards: 1 });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;