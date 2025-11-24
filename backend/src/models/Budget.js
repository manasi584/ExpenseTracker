const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  budget: { type: Number, required: true, default: 20000 },
  spent: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);