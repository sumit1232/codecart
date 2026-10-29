const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000, default: '' },
}, { timestamps: true });
schema.index({ product: 1, user: 1 }, { unique: true }); // one review per buyer
module.exports = mongoose.model('Review', schema);
