const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 1 },
  category: { type: String, default: 'Web App' },
  techStack: [String],
  demoUrl: String,
  image: { type: String, required: true },   // cover image filename
  gallery: [String],                          // extra screenshots (max 4)
  file: { path: String, originalName: String, size: Number }, // private zip
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'archived'], default: 'pending' },
  sales: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.methods.toPublic = function () {
  const o = this.toObject();
  if (o.file) delete o.file.path; // never leak the server path
  return o;
};
module.exports = mongoose.model('Product', productSchema);
