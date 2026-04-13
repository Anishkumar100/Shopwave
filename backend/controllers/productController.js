const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const FlashSale = require('../models/FlashSale');
const APIFeatures = require('../utils/apiFeatures');

// Helper: apply active flash sale to list of products
const withFlashSale = async (products) => {
  const sale = await FlashSale.getActive();
  if (!sale) return Array.isArray(products) ? products : products;
  if (Array.isArray(products)) return products.map((p) => FlashSale.applyToProduct(p, sale));
  return FlashSale.applyToProduct(products, sale);
};

// @desc   Get all products
// @route  GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const resPerPage = Number(req.query.limit) || 12;
  const totalCount = await Product.countDocuments({ isActive: true });
  const features = new APIFeatures(
    Product.find({ isActive: true }).populate('category', 'name slug'),
    req.query
  ).search().filter().sort().paginate(resPerPage);
  const rawProducts = await features.query;
  const products = await withFlashSale(rawProducts);
  res.status(200).json({
    success: true,
    count: products.length,
    totalCount,
    totalPages: Math.ceil(totalCount / resPerPage),
    currentPage: Number(req.query.page) || 1,
    products,
  });
});

// @desc   Get featured products
// @route  GET /api/products/featured
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const raw = await Product.find({ isFeatured: true, isActive: true })
    .populate('category', 'name')
    .limit(8);
  const products = await withFlashSale(raw);
  res.status(200).json({ success: true, products });
});

// @desc   Get single product
// @route  GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('reviews.user', 'name avatar');
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const withSale = await withFlashSale(product);
  res.status(200).json({ success: true, product: withSale });
});

// @desc   Create product (Admin)
// @route  POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  req.body.seller = req.user.id;
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((f) => ({ public_id: f.filename, url: `/uploads/${f.filename}` }));
  }
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, product });
});

// @desc   Update product (Admin)
// @route  PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.status(200).json({ success: true, product });
});

// @desc   Delete product (Admin)
// @route  DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  await product.deleteOne();
  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

// @desc   Create/Update review
// @route  POST /api/products/:id/reviews
exports.createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user.id.toString());
  if (alreadyReviewed) {
    alreadyReviewed.rating = Number(rating);
    alreadyReviewed.comment = comment;
  } else {
    product.reviews.push({ user: req.user.id, name: req.user.name, rating: Number(rating), comment });
    product.numReviews = product.reviews.length;
  }
  product.ratings = product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ success: true, message: 'Review submitted' });
});

// @desc   Delete review
// @route  DELETE /api/products/:id/reviews/:reviewId
exports.deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
  product.numReviews = product.reviews.length;
  product.ratings = product.reviews.length > 0
    ? product.reviews.reduce((acc, r) => r.rating + acc, 0) / product.reviews.length : 0;
  await product.save();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

// @desc   Get admin products
// @route  GET /api/products/admin/all
exports.getAdminProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate('category', 'name');
  res.status(200).json({ success: true, count: products.length, products });
});
