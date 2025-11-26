const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  value: { type: Number, required: true },
  investmentType: { type: String, default: 'Index Fund', trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);