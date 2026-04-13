const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const { sendTokenResponse } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc   Register user
// @route  POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) { res.status(400); throw new Error('User already exists with this email'); }
  const user = await User.create({ name, email, password });
  sendTokenResponse(user, 201, res);
});

// @desc   Login user
// @route  POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { 
    res.status(400); 
    throw new Error('Please provide email and password'); 
  }
  
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.comparePassword(password))) {
    res.status(401); 
    throw new Error('Invalid email or password');
  }

  // 👇 ADD THIS: Check if the frontend is specifically asking for an admin login
  // You would need to pass `isAdminLogin: true` from your frontend admin login form
  if (req.body.isAdminLogin && user.role !== 'admin') {
     res.status(403); 
     throw new Error('Access denied. Admin resources only.');
  }

  sendTokenResponse(user, 200, res);
});

// @desc   Logout
// @route  GET /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 10 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc   Get current user
// @route  GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist', 'name images price');
  res.status(200).json({ success: true, user });
});

// @desc   Update profile
// @route  PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email, phone, address } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email, phone, address },
    { new: true, runValidators: true }
  );
  res.status(200).json({ success: true, user });
});

// @desc   Change password
// @route  PUT /api/auth/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    res.status(401); throw new Error('Current password is incorrect');
  }
  user.password = newPassword;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc   Forgot password
// @route  POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('No user found with this email'); }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password (valid for 15 minutes):</p>
    <a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  try {
    await sendEmail({ email: user.email, subject: 'ShopWave - Password Reset', html });
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500); throw new Error('Email could not be sent');
  }
});

// @desc   Reset password
// @route  PUT /api/auth/reset-password/:token
exports.resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) { res.status(400); throw new Error('Invalid or expired reset token'); }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  sendTokenResponse(user, 200, res);
});

// @desc   Toggle wishlist
// @route  POST /api/auth/wishlist/:productId
exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const productId = req.params.productId;
  const index = user.wishlist.indexOf(productId);
  let message;
  if (index > -1) { user.wishlist.splice(index, 1); message = 'Removed from wishlist'; }
  else { user.wishlist.push(productId); message = 'Added to wishlist'; }
  await user.save();
  res.status(200).json({ success: true, message, wishlist: user.wishlist });
});
