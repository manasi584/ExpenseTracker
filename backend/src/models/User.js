const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  budget: { type: Number, default: 20000 },
  cards: { type: Number, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);