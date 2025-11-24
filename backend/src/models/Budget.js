const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  budget: { type: Number, required: true, default: 20000 },
  spent: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);