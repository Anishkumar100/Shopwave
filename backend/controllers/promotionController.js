const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');
const FlashSale = require('../models/FlashSale');
const Bundle = require('../models/Bundle');

/* ==================== COUPONS ==================== */
exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json({ success: true, coupons });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true });
});

// Public: validate a coupon code against a subtotal
exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) { res.status(400); throw new Error('Code is required'); }
  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) return res.status(404).json({ success: false, reason: 'Invalid coupon code' });
  const result = coupon.validateForOrder(Number(subtotal) || 0);
  if (!result.ok) return res.status(400).json({ success: false, reason: result.reason });
  res.json({ success: true, coupon, discount: result.discount, freeShipping: result.freeShipping });
});

/* ==================== FLASH SALE ==================== */
exports.getFlashSale = asyncHandler(async (req, res) => {
  const all = await FlashSale.find().sort('-createdAt');
  const active = await FlashSale.getActive();
  res.json({ success: true, all, active });
});

exports.createFlashSale = asyncHandler(async (req, res) => {
  if (req.body.active) await FlashSale.updateMany({ active: true }, { active: false });
  const sale = await FlashSale.create(req.body);
  res.status(201).json({ success: true, sale });
});

exports.updateFlashSale = asyncHandler(async (req, res) => {
  if (req.body.active) await FlashSale.updateMany({ _id: { $ne: req.params.id }, active: true }, { active: false });
  const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sale) { res.status(404); throw new Error('Flash sale not found'); }
  res.json({ success: true, sale });
});

exports.deleteFlashSale = asyncHandler(async (req, res) => {
  await FlashSale.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ==================== BUNDLES ==================== */
exports.getBundles = asyncHandler(async (req, res) => {
  const page  = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 9;
  const skip = (page - 1) * limit;
  const total = await Bundle.countDocuments({ active: true });
  const bundles = await Bundle.find({ active: true })
    .populate('products', 'name price images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);
  res.json({
    success: true,
    bundles,
    totalCount: total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: page,
  });
});

exports.getAllBundlesAdmin = asyncHandler(async (req, res) => {
  const bundles = await Bundle.find().populate('products', 'name price').sort('-createdAt');
  res.json({ success: true, bundles });
});

exports.createBundle = asyncHandler(async (req, res) => {
  if (!req.body.products || req.body.products.length < 2) {
    res.status(400); throw new Error('A bundle must link at least 2 products');
  }
  const bundle = await Bundle.create(req.body);
  res.status(201).json({ success: true, bundle });
});

exports.updateBundle = asyncHandler(async (req, res) => {
  const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!bundle) { res.status(404); throw new Error('Bundle not found'); }
  res.json({ success: true, bundle });
});

exports.deleteBundle = asyncHandler(async (req, res) => {
  await Bundle.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});
