const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc   Admin - Get all users
// @route  GET /api/users
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.status(200).json({ success: true, count: users.length, users });
});

// @desc   Admin - Get single user
// @route  GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.status(200).json({ success: true, user });
});

// @desc   Admin - Update user
// @route  PUT /api/users/:id
exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.status(200).json({ success: true, user });
});

// @desc   Admin - Delete user
// @route  DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});

// @desc   Admin - Dashboard Stats
// @route  GET /api/users/admin/stats
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const Order = require('../models/Order');
  const Product = require('../models/Product');
  const [totalUsers, totalOrders, totalProducts, revenueData] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
    ]),
  ]);
  const totalRevenue = revenueData[0]?.totalRevenue || 0;
  const recentOrders = await Order.find().populate('user', 'name email').sort('-createdAt').limit(5);
  const monthlySales = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, sales: { $sum: '$totalPrice' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
  res.status(200).json({ success: true, stats: { totalUsers, totalOrders, totalProducts, totalRevenue }, recentOrders, monthlySales });
});
