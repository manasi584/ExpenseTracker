const mongoose = require('mongoose');

const monthlySummarySchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  totalBudget: { type: Number, required: true },
  totalSpent: { type: Number, required: true },
  totalIncome: { type: Number, default: 0 },
  categoryBreakdown: [{
    category: String,
    allocated: Number,
    spent: Number
  }],
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true }
}, { timestamps: true });

module.exports = mongoose.model('MonthlySummary', monthlySummarySchema);