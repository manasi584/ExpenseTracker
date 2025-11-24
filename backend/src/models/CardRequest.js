const mongoose = require('mongoose');

const cardRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  cardType: { type: String, default: 'virtual' }
}, { timestamps: true });

module.exports = mongoose.model('CardRequest', cardRequestSchema);