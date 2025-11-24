const express = require('express');
const CardRequest = require('../models/CardRequest');
const User = require('../models/User');
const requestLogger = require('../../middleware/requestLogger');

const router = express.Router();
router.use(requestLogger);

// POST /api/cards/request
router.post('/request', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const existingRequest = await CardRequest.findOne({ userId: user._id });
    if (existingRequest) {
      return res.status(400).json({ error: 'Card request already exists', status: existingRequest.status });
    }
    
    const cardRequest = await CardRequest.create({ userId: user._id });
    res.status(201).json({ message: 'Card request submitted successfully', request: cardRequest });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit card request' });
  }
});

// GET /api/cards/status
router.get('/status', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const cardRequest = await CardRequest.findOne({ userId: user._id });
    res.json({ hasRequest: !!cardRequest, status: cardRequest?.status || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get card status' });
  }
});

// PUT /api/cards/approve/:requestId
router.put('/approve/:requestId', async (req, res) => {
  try {
    const cardRequest = await CardRequest.findById(req.params.requestId);
    if (!cardRequest) {
      return res.status(404).json({ error: 'Card request not found' });
    }
    
    // Update request status to approved
    cardRequest.status = 'approved';
    await cardRequest.save();
    
    // Increment user's card count
    const user = await User.findById(cardRequest.userId);
    if (user) {
      user.cards += 1;
      await user.save();
    }
    
    res.json({ message: 'Card request approved and user card count updated', cardRequest, userCards: user.cards });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve card request' });
  }
});

module.exports = router;