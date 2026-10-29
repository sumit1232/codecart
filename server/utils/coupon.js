const Coupon = require('../models/Coupon');
const httpError = require('./httpError');

module.exports = async (code, price) => {
  const c = await Coupon.findOne({ code: String(code || '').trim().toUpperCase(), active: true });
  if (!c) throw httpError(400, 'That coupon code is not valid');
  if (c.expiresAt && c.expiresAt < new Date()) throw httpError(400, 'That coupon has expired');
  if (c.maxUses && c.used >= c.maxUses) throw httpError(400, 'That coupon has been fully used');
  const final = Math.max(1, Math.round(price * (1 - c.percent / 100))); // Razorpay minimum is ₹1
  return { coupon: c, percent: c.percent, final, discount: price - final };
};
