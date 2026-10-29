const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const User = require('../models/User');
const wrap = require('../utils/wrap');
const publicUser = require('../utils/publicUser');
const { protect } = require('../middleware/auth');
const { avatarUpload } = require('../middleware/upload');

router.use(protect);

router.get('/wishlist', wrap(async (req, res) => {
  const u = await User.findById(req.user._id).populate({
    path: 'wishlist', match: { status: 'approved' }, populate: { path: 'seller', select: 'name' },
  });
  res.json(u.wishlist.map((p) => p.toPublic()));
}));

router.post('/wishlist/:id', wrap(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid project' });
  const has = req.user.wishlist.some((x) => x.equals(id));
  await User.updateOne({ _id: req.user._id }, has ? { $pull: { wishlist: id } } : { $addToSet: { wishlist: id } });
  const u = await User.findById(req.user._id);
  res.json({ added: !has, wishlist: u.wishlist.map(String) });
}));

// Profile: update name and upload an avatar (multer)
router.put('/profile', (req, res, next) => avatarUpload(req, res, (err) => (err ? next(err) : next())), wrap(async (req, res) => {
  const u = req.user;
  if (req.body.name?.trim()) u.name = req.body.name.trim();
  if (req.file) {
    if (u.avatar && !u.avatar.startsWith('http')) fs.unlink(path.join(__dirname, '..', 'uploads', 'avatars', u.avatar), () => {});
    u.avatar = req.file.filename;
  }
  await u.save();
  res.json({ user: publicUser(u) });
}));

module.exports = router;
