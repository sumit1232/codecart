const router = require('express').Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const wrap = require('../utils/wrap');
const httpError = require('../utils/httpError');
const applyCoupon = require('../utils/coupon');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const safeEqual = (a, b) => { const x = Buffer.from(a), y = Buffer.from(String(b || '')); return x.length === y.length && crypto.timingSafeEqual(x, y); };

// Atomic "created -> paid". Safe to call twice (verify route + webhook): only the first call counts the sale.
async function markPaid(razorpayOrderId, paymentId) {
  const order = await Order.findOneAndUpdate({ razorpayOrderId, status: 'created' }, { status: 'paid', razorpayPaymentId: paymentId }, { new: true });
  if (order) {
    await Product.findByIdAndUpdate(order.product, { $inc: { sales: 1 } });
    if (order.coupon) await Coupon.updateOne({ code: order.coupon }, { $inc: { used: 1 } });
  }
}

async function getBuyable(userId, productId) {
  const product = await Product.findOne({ _id: productId, status: 'approved' });
  if (!product) throw httpError(404, 'Project not found');
  if (product.seller.equals(userId)) throw httpError(400, 'You cannot buy your own project');
  if (await Order.exists({ user: userId, product: product._id, status: 'paid' })) throw httpError(400, 'You already own this project');
  return product;
}

router.post('/coupon-check', protect, wrap(async (req, res) => {
  const product = await getBuyable(req.user._id, req.body.productId);
  const r = await applyCoupon(req.body.code, product.price);
  res.json({ percent: r.percent, final: r.final, discount: r.discount });
}));

// The amount is always computed on the server (price + coupon), never taken from the browser
router.post('/create', protect, wrap(async (req, res) => {
  const product = await getBuyable(req.user._id, req.body.productId);
  let amount = product.price, couponCode;
  if (req.body.coupon) { const r = await applyCoupon(req.body.coupon, product.price); amount = r.final; couponCode = r.coupon.code; }

  const rzpOrder = await razorpay.orders.create({ amount: Math.round(amount * 100), currency: 'INR', receipt: `rcpt_${Date.now()}` });
  await Order.create({ user: req.user._id, product: product._id, amount, discount: product.price - amount, coupon: couponCode, razorpayOrderId: rzpOrder.id });
  res.json({ order: rzpOrder, key: process.env.RAZORPAY_KEY_ID, product: { title: product.title } });
}));

router.post('/verify', protect, wrap(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (!safeEqual(expected, razorpay_signature)) throw httpError(400, 'Payment verification failed');
  const order = await Order.findOne({ razorpayOrderId: razorpay_order_id, user: req.user._id });
  if (!order) throw httpError(404, 'Order not found');
  await markPaid(razorpay_order_id, razorpay_payment_id);
  res.json({ message: 'Payment successful', productId: order.product });
}));

// Razorpay -> server webhook (backup if the buyer closes the tab). Body arrives raw, see server.js
router.post('/webhook', wrap(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return res.sendStatus(404);
  const expected = crypto.createHmac('sha256', secret).update(req.body).digest('hex');
  if (!safeEqual(expected, req.headers['x-razorpay-signature'])) return res.sendStatus(400);
  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured') {
    const p = event.payload.payment.entity;
    await markPaid(p.order_id, p.id);
  }
  res.json({ ok: true });
}));

router.get('/my', protect, wrap(async (req, res) => {
  res.json(await Order.find({ user: req.user._id, status: 'paid' })
    .populate({ path: 'product', select: 'title image techStack file.originalName file.size' }).sort('-createdAt'));
}));

// Buyers, the owning seller and admins can download
router.get('/download/:productId', protect, wrap(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) throw httpError(404, 'Project not found');
  const allowed = req.user.role === 'admin' || product.seller.equals(req.user._id) ||
    await Order.exists({ user: req.user._id, product: product._id, status: 'paid' });
  if (!allowed) throw httpError(403, 'Buy this project to download it');
  res.download(product.file.path, product.file.originalName);
}));

module.exports = router;
