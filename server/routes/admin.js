const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const wrap = require('../utils/wrap');
const httpError = require('../utils/httpError');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin')); // every route here is admin-only

router.get('/stats', wrap(async (req, res) => {
  const [users, products, pending, paid] = await Promise.all([
    User.countDocuments(), Product.countDocuments({ status: 'approved' }), Product.countDocuments({ status: 'pending' }), Order.find({ status: 'paid' }, 'amount'),
  ]);
  const revenue = paid.reduce((s, o) => s + o.amount, 0);
  res.json({ users, products, pending, orders: paid.length, revenue, commission: Math.round(revenue * Number(process.env.COMMISSION_PERCENT || 10) / 100) });
}));

router.get('/products', wrap(async (req, res) => {
  const list = await Product.find().populate('seller', 'name email').sort('-createdAt');
  res.json(list.map((p) => p.toPublic()));
}));

router.patch('/products/:id/status', wrap(async (req, res) => {
  if (!['approved', 'rejected', 'pending'].includes(req.body.status)) throw httpError(400, 'Invalid status');
  const p = await Product.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(p.toPublic());
}));

router.get('/users', wrap(async (req, res) => res.json(await User.find().sort('-createdAt'))));

router.patch('/users/:id/role', wrap(async (req, res) => {
  if (!['student', 'seller', 'admin'].includes(req.body.role)) throw httpError(400, 'Invalid role');
  if (req.params.id === String(req.user._id)) throw httpError(400, 'You cannot change your own role');
  res.json(await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }));
}));

// ---- Coupons ----
router.get('/coupons', wrap(async (req, res) => res.json(await Coupon.find().sort('-createdAt'))));

router.post('/coupons', wrap(async (req, res) => {
  const { code, percent, maxUses, expiresAt } = req.body;
  if (!code || !(Number(percent) >= 1 && Number(percent) <= 90)) throw httpError(400, 'Enter a code and a discount from 1 to 90 percent');
  if (await Coupon.exists({ code: code.trim().toUpperCase() })) throw httpError(400, 'That code already exists');
  res.status(201).json(await Coupon.create({ code, percent: Number(percent), maxUses: Number(maxUses) || 0, expiresAt: expiresAt || undefined }));
}));

router.patch('/coupons/:id/toggle', wrap(async (req, res) => {
  const c = await Coupon.findById(req.params.id);
  c.active = !c.active; await c.save();
  res.json(c);
}));

router.delete('/coupons/:id', wrap(async (req, res) => { await Coupon.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));

module.exports = router;
