const mongoose = require('mongoose');
module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  amount: { type: Number, required: true },     // what the buyer paid
  discount: { type: Number, default: 0 },
  coupon: String,
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: String,
  status: { type: String, enum: ['created', 'paid'], default: 'created' },
}, { timestamps: true }));
