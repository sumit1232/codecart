require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const passport = require('passport');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);

require('./config/passport')();
const app = express();
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL }));

// The Razorpay webhook needs the exact raw bytes to check its signature, so it must come before express.json()
app.use('/api/orders/webhook', express.raw({ type: '*/*' }));
app.use(express.json());
app.use(passport.initialize());

// Cover images, screenshots and avatars are public. Project zips are only served through /api/orders/download.
app.use('/uploads/images', express.static(path.join(__dirname, 'uploads', 'images')));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 80 }), require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.use((err, req, res, next) => {
  const known = err.status || err.name === 'MulterError' || /^(Images must|Project file)/.test(err.message);
  if (!known) console.error(err);
  const msg = err.code === 'LIMIT_FILE_SIZE' ? 'That file is too large' : err.code === 'LIMIT_UNEXPECTED_FILE' ? 'Too many files in that field' : err.message;
  res.status(err.status || (known ? 400 : 500)).json({ message: known ? msg : 'Something went wrong on the server' });
});

connectDB().then(() => app.listen(process.env.PORT || 5000, () => console.log('API running on port', process.env.PORT || 5000)))
  .catch((e) => { console.error('DB connection failed:', e.message); process.exit(1); });
