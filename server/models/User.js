const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6, select: false, required: function () { return !this.googleId; } },
  googleId: { type: String, unique: true, sparse: true },
  avatar: String, // uploaded filename, or a full Google photo URL
  role: { type: String, enum: ['student', 'seller', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  otpHash: { type: String, select: false },
  otpExpires: { type: Date, select: false },
  otpAttempts: { type: Number, default: 0, select: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = function (plain) { return this.password ? bcrypt.compare(plain, this.password) : false; };

module.exports = mongoose.model('User', userSchema);
