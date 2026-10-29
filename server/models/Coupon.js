const mongoose = require('mongoose');
module.exports = mongoose.model('Coupon', new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  percent: { type: Number, required: true, min: 1, max: 90 },
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  used: { type: Number, default: 0 },
  expiresAt: Date,
  active: { type: Boolean, default: true },
}, { timestamps: true }));
