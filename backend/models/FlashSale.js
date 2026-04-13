const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  title:       { type: String, default: 'FLASH SALE' },
  subtitle:    { type: String, default: 'Limited time offer' },
  percentage:  { type: Number, required: true, min: 1, max: 90 }, // applied site-wide
  active:      { type: Boolean, default: false },
  startsAt:    { type: Date, default: Date.now },
  endsAt:      { type: Date, required: true },
}, { timestamps: true });

// Returns the single currently-active flash sale or null
flashSaleSchema.statics.getActive = async function () {
  const now = new Date();
  return this.findOne({ active: true, startsAt: { $lte: now }, endsAt: { $gt: now } }).sort('-createdAt');
};

// Apply flash sale discount to a product object (plain JS, non-persistent)
flashSaleSchema.statics.applyToProduct = function (product, sale) {
  if (!sale || !product || typeof product !== 'object') return product;
  const p = typeof product.toObject === 'function' ? product.toObject() : { ...product };
  p.originalPrice = p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price;
  p.price = Math.round(p.price * (1 - sale.percentage / 100));
  p.flashSaleActive = true;
  p.flashSalePercent = sale.percentage;
  return p;
};

module.exports = mongoose.model('FlashSale', flashSaleSchema);
