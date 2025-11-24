const mongoose = require('mongoose');

const envelopeAllocationSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  allocated: { type: Number, required: true, min: 0 },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true }
}, { timestamps: true });

module.exports = mongoose.model('EnvelopeAllocation', envelopeAllocationSchema);