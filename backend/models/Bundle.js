const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  image:       { type: String, default: '' },
  products:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
  price:       { type: Number, required: true }, // bundle price (final)
  mrp:         { type: Number, required: true }, // sum of individual MRPs (reference)
  badge:       { type: String, default: '' },
  active:      { type: Boolean, default: true },
}, { timestamps: true });

bundleSchema.virtual('discountPercent').get(function () {
  if (!this.mrp || this.mrp <= 0) return 0;
  return Math.round((1 - this.price / this.mrp) * 100);
});

bundleSchema.set('toJSON', { virtuals: true });
bundleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Bundle', bundleSchema);
