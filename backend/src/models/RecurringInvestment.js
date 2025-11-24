const mongoose = require('mongoose');

const recurringInvestmentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  frequency: { type: String, required: true, enum: ['daily', 'weekly', 'monthly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  investmentType: { type: String, required: true, trim: true },
  currency: { type: String, required: true, enum: ['INR', 'USD', 'CNY'], default: 'INR' },
  isActive: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('RecurringInvestment', recurringInvestmentSchema);