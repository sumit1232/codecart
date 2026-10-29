/*
  Fills the database with demo users, projects (images + zips), orders, reviews, coupons and wishlists.

    npm run seed:demo              (only works on an empty database)
    npm run seed:demo -- --reset   (WIPES users, projects, orders, reviews, coupons and uploaded files first)

  All demo accounts use the password in seed-data.js (Demo@12345).
*/
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Coupon = require('./models/Coupon');
const data = require('./seed-data');
require('dns').setServers(['8.8.8.8', '1.1.1.1']);

const ASSETS = path.join(__dirname, 'seed-assets');
const UPLOADS = path.join(__dirname, 'uploads');
const ago = (days, hour = 11) => { const d = new Date(Date.now() - days * 864e5); d.setHours(hour, Math.floor(Math.random() * 60), 0, 0); return d; };
const pad = (n) => String(n).padStart(3, '0');

function copyAsset(rel, folder) {
  const ext = path.extname(rel);
  const filename = crypto.randomBytes(16).toString('hex') + ext;
  const dest = path.join(UPLOADS, folder, filename);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(ASSETS, rel), dest);
  return { filename, path: dest, size: fs.statSync(dest).size };
}

function clearUploads() {
  ['images', 'files', 'avatars'].forEach((f) => {
    const dir = path.join(UPLOADS, f);
    if (fs.existsSync(dir)) fs.readdirSync(dir).filter((n) => n !== '.gitkeep').forEach((n) => fs.unlinkSync(path.join(dir, n)));
  });
}

(async () => {
  if (process.env.NODE_ENV === 'production') { console.error('Refusing to seed demo data when NODE_ENV=production'); process.exit(1); }
  const reset = process.argv.includes('--reset');
  await mongoose.connect(process.env.MONGO_URI);

  if (!reset && (await Product.exists({}))) {
    console.log('The database already has projects, so nothing was changed.\nTo start over run: npm run seed:demo -- --reset   (this deletes ALL users, projects, orders, reviews and coupons)');
    process.exit(1);
  }
  if (reset) {
    await Promise.all([User, Product, Order, Review, Coupon].map((m) => m.deleteMany({})));
    clearUploads();
    console.log('Existing data cleared');
  }

  // ---- Admin ----
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@codecart.com').toLowerCase();
  await User.create({ name: 'Admin', email: adminEmail, password: process.env.ADMIN_PASSWORD || 'Admin@12345', role: 'admin', isVerified: true, createdAt: ago(90) });

  // ---- Users ----
  const U = {};
  for (const u of data.users) {
    const doc = {
      name: u.name, email: u.email, role: u.role, isVerified: u.verified !== false, createdAt: ago(u.days),
      avatar: u.avatar ? copyAsset(`avatars/${u.avatar}.png`, 'avatars').filename : undefined,
    };
    if (u.google) doc.googleId = `demo-google-${u.key}`; else doc.password = data.PASSWORD;
    U[u.key] = await User.create(doc);
  }

  // ---- Coupons ----
  for (const c of data.coupons) {
    await Coupon.create({
      code: c.code, percent: c.percent, maxUses: c.maxUses, active: c.active, createdAt: ago(c.days),
      expiresAt: c.expiredDaysAgo ? ago(c.expiredDaysAgo) : ago(-90), // others are valid for 90 more days
    });
  }
  const pct = Object.fromEntries(data.coupons.map((c) => [c.code, c.percent]));

  // ---- Products ----
  const P = {};
  for (const p of data.products) {
    const cover = copyAsset(`images/${p.slug}-cover.png`, 'images');
    const gallery = [1, 2].map((n) => copyAsset(`images/${p.slug}-${n}.png`, 'images').filename);
    const zip = copyAsset(`zips/${p.slug}.zip`, 'files');
    P[p.slug] = await Product.create({
      title: p.title, description: p.desc, price: p.price, category: p.category, techStack: p.stack, demoUrl: p.demo,
      image: cover.filename, gallery, file: { path: zip.path, originalName: `${p.slug}.zip`, size: zip.size },
      seller: U[p.seller]._id, status: p.status, createdAt: ago(p.days),
    });
  }

  // ---- Orders + reviews ----
  let n = 0; const sales = {}, couponUse = {}, ratings = {};
  for (const o of data.purchases) {
    n += 1;
    const product = P[o.p], listPrice = data.products.find((x) => x.slug === o.p).price;
    const amount = o.c ? Math.max(1, Math.round(listPrice * (1 - pct[o.c] / 100))) : listPrice; // same formula as the API
    const paid = o.st !== 'created';
    const when = ago(o.d);
    await Order.create({
      user: U[o.u]._id, product: product._id, amount, discount: listPrice - amount, coupon: o.c,
      razorpayOrderId: `order_DEMO${pad(n)}`, razorpayPaymentId: paid ? `pay_DEMO${pad(n)}` : undefined,
      status: paid ? 'paid' : 'created', createdAt: when,
    });
    if (!paid) continue;
    sales[o.p] = (sales[o.p] || 0) + 1;
    if (o.c) couponUse[o.c] = (couponUse[o.c] || 0) + 1;
    if (o.r) {
      await Review.create({ product: product._id, user: U[o.u]._id, rating: o.r[0], comment: o.r[1], createdAt: ago(Math.max(0, o.d - 2), 18) });
      (ratings[o.p] ||= []).push(o.r[0]);
    }
  }

  // ---- Counters (the app keeps these up to date at runtime) ----
  for (const p of data.products) {
    const r = ratings[p.slug] || [];
    await Product.updateOne({ _id: P[p.slug]._id }, {
      sales: sales[p.slug] || 0, numReviews: r.length,
      rating: r.length ? Math.round((r.reduce((a, b) => a + b, 0) / r.length) * 10) / 10 : 0,
    });
  }
  for (const [code, used] of Object.entries(couponUse)) await Coupon.updateOne({ code }, { used });

  // ---- Wishlists ----
  for (const [u, slugs] of Object.entries(data.wishlists)) await User.updateOne({ _id: U[u]._id }, { wishlist: slugs.map((s) => P[s]._id) });

  const paidOrders = data.purchases.filter((o) => o.st !== 'created').length;
  console.log(`\nDemo data ready: ${data.users.length + 1} users, ${data.products.length} projects, ${paidOrders} paid orders, ${Object.values(ratings).flat().length} reviews, ${data.coupons.length} coupons\n`);
  console.log('Logins (password for all demo users: ' + data.PASSWORD + ')');
  console.log(`  admin    ${adminEmail}  (password from ADMIN_PASSWORD, default Admin@12345)`);
  data.users.filter((u) => !u.google && u.verified !== false).forEach((u) => console.log(`  ${u.role.padEnd(8)} ${u.email}`));
  console.log('  (Priya Patel is a Google-only account, Rahul Nair never verified his email)');
  console.log('\nCoupons: WELCOME10, STUDENT20 work. FESTIVE25 is expired and SUMMER15 is switched off.');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
