const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Review = require('../models/Review');
const Order = require('../models/Order');
const wrap = require('../utils/wrap');
const httpError = require('../utils/httpError');
const { projectUpload } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const rm = (p) => p && fs.existsSync(p) && fs.unlink(p, () => {});
const imgPath = (n) => path.join(__dirname, '..', 'uploads', 'images', n);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = { newest: '-createdAt', popular: '-sales', price_asc: 'price', price_desc: '-price', rating: '-rating' };

router.get('/', wrap(async (req, res) => {
  const { q, category, sort } = req.query;
  const filter = { status: 'approved' };
  if (category && category !== 'All') filter.category = category;
  if (q) filter.$or = [{ title: new RegExp(esc(q), 'i') }, { techStack: new RegExp(esc(q), 'i') }];
  const list = await Product.find(filter).populate('seller', 'name').sort(SORTS[sort] || '-createdAt');
  res.json(list.map((p) => p.toPublic()));
}));

router.get('/mine/list', protect, authorize('seller', 'admin'), wrap(async (req, res) => {
  const list = await Product.find({ seller: req.user._id }).sort('-createdAt');
  res.json(list.map((p) => p.toPublic()));
}));

// Seller earnings: gross sales and net after platform commission
router.get('/mine/stats', protect, authorize('seller', 'admin'), wrap(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }, '_id');
  const paid = await Order.find({ product: { $in: products.map((p) => p._id) }, status: 'paid' }, 'amount');
  const gross = paid.reduce((s, o) => s + o.amount, 0);
  const fee = Number(process.env.COMMISSION_PERCENT || 10);
  res.json({ listings: products.length, sales: paid.length, gross, net: Math.round(gross * (1 - fee / 100)), fee });
}));

router.get('/:id', wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Project not found');
  const p = await Product.findById(req.params.id).populate('seller', 'name');
  if (!p || p.status !== 'approved') throw httpError(404, 'Project not found');
  res.json(p.toPublic());
}));

// ---- Reviews (buyers only, one per buyer) ----
router.get('/:id/reviews', wrap(async (req, res) => {
  res.json(await Review.find({ product: req.params.id }).populate('user', 'name avatar').sort('-createdAt'));
}));

router.post('/:id/reviews', protect, wrap(async (req, res) => {
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) throw httpError(400, 'Pick a rating from 1 to 5');
  const bought = await Order.exists({ user: req.user._id, product: req.params.id, status: 'paid' });
  if (!bought) throw httpError(403, 'Only buyers can review this project');
  await Review.findOneAndUpdate({ product: req.params.id, user: req.user._id },
    { rating, comment: (req.body.comment || '').slice(0, 1000) }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const [agg] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(req.params.id) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(req.params.id, { rating: Math.round(agg.avg * 10) / 10, numReviews: agg.n });
  res.status(201).json({ message: 'Review saved' });
}));

// ---- Upload a project: cover + screenshots + zip ----
router.post('/', protect, authorize('seller', 'admin'),
  (req, res, next) => projectUpload(req, res, (err) => (err ? next(err) : next())),
  wrap(async (req, res) => {
    const files = Object.values(req.files || {}).flat();
    try {
      const cover = req.files?.image?.[0], zip = req.files?.file?.[0], gallery = req.files?.gallery || [];
      const { title, description, price, category, techStack, demoUrl } = req.body;
      if (!cover || !zip) throw httpError(400, 'A cover image and a .zip file are required');
      if (!title || !description || !(Number(price) >= 1)) throw httpError(400, 'Title, description and a price of ₹1 or more are required');
      if (demoUrl && !/^https?:\/\//i.test(demoUrl)) throw httpError(400, 'Demo link must start with http:// or https://');

      const product = await Product.create({
        title, description, price: Math.round(Number(price)), category, demoUrl: demoUrl || undefined,
        techStack: (techStack || '').split(',').map((s) => s.trim()).filter(Boolean),
        image: cover.filename, gallery: gallery.map((g) => g.filename),
        file: { path: zip.path, originalName: zip.originalname, size: zip.size },
        seller: req.user._id, status: req.user.role === 'admin' ? 'approved' : 'pending',
      });
      res.status(201).json(product.toPublic());
    } catch (e) { files.forEach((f) => rm(f.path)); throw e; }
  }));

// Delete: projects that already have buyers are archived so buyers keep their download
router.delete('/:id', protect, authorize('seller', 'admin'), wrap(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Not found');
  if (req.user.role !== 'admin' && !p.seller.equals(req.user._id)) throw httpError(403, 'Not your project');
  if (p.sales > 0) {
    p.status = 'archived'; await p.save();
    return res.json({ message: 'Archived. It is hidden from the store, and buyers keep access.' });
  }
  rm(imgPath(p.image)); p.gallery.forEach((g) => rm(imgPath(g))); rm(p.file?.path);
  await Review.deleteMany({ product: p._id });
  await p.deleteOne();
  res.json({ message: 'Project deleted' });
}));

module.exports = router;
