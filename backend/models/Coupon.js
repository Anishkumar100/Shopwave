const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:        { type: String, enum: ['percent', 'flat', 'shipping'], required: true },
  value:       { type: Number, required: true, default: 0 },
  minOrder:    { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 0 }, // 0 = no cap (only for percent)
  label:       { type: String, default: '' },
  active:      { type: Boolean, default: true },
  expiresAt:   { type: Date, default: null },
  usageLimit:  { type: Number, default: 0 }, // 0 = unlimited
  usedCount:   { type: Number, default: 0 },
}, { timestamps: true });

couponSchema.methods.validateForOrder = function (subtotal) {
  if (!this.active) return { ok: false, reason: 'Coupon is inactive' };
  if (this.expiresAt && new Date() > this.expiresAt) return { ok: false, reason: 'Coupon expired' };
  if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) return { ok: false, reason: 'Coupon usage limit reached' };
  if (subtotal < this.minOrder) return { ok: false, reason: `Minimum order ₹${this.minOrder} required` };
  let discount = 0, freeShipping = false;
  if (this.type === 'percent')  discount = Math.min(Math.round(subtotal * this.value / 100), this.maxDiscount || Infinity);
  if (this.type === 'flat')     discount = this.value;
  if (this.type === 'shipping') freeShipping = true;
  return { ok: true, discount, freeShipping };
};

module.exports = mongoose.model('Coupon', couponSchema);
