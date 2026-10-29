const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Please log in' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user || !user.isVerified) return res.status(401).json({ message: 'Account not found or not verified' });
    req.user = user;
    next();
  } catch { res.status(401).json({ message: 'Session expired, log in again' }); }
};

// Role-based access: authorize('admin'), authorize('seller', 'admin')
exports.authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have access to this action' });
