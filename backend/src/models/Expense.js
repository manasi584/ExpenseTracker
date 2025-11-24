const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  time: { type: Date, default: Date.now },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);
