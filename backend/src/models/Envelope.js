const mongoose = require('mongoose');

const envelopeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  allocated: { type: Number, required: true, min: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Envelope', envelopeSchema);