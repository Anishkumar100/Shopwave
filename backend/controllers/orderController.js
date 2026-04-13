const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc   Create new order
// @route  POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (!orderItems || orderItems.length === 0) { res.status(400); throw new Error('No order items'); }
  const order = await Order.create({
    user: req.user.id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    statusHistory: [{ status: 'pending', note: 'Order placed successfully' }],
  });
  res.status(201).json({ success: true, order });
});

// @desc   Get my orders
// @route  GET /api/orders/myorders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc   Get single order
// @route  GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to view this order');
  }
  res.status(200).json({ success: true, order });
});

// @desc   Update order to paid (after payment verification)
// @route  PUT /api/orders/:id/pay
exports.updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.isPaid = true;
  order.paidAt = Date.now();
  order.orderStatus = 'processing';
  order.paymentResult = {
    cfOrderId: req.body.cfOrderId,
    orderId: req.body.orderId,
    paymentStatus: req.body.paymentStatus,
    paymentTime: req.body.paymentTime,
    txId: req.body.txId,
  };
  order.statusHistory.push({ status: 'processing', note: 'Payment received, processing order' });
  // Reduce stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
  }
  const updatedOrder = await order.save();
  res.status(200).json({ success: true, order: updatedOrder });
});

// @desc   Admin - Get all orders
// @route  GET /api/orders/admin
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort('-createdAt');
  const totalAmount = orders.reduce((acc, o) => o.isPaid ? acc + o.totalPrice : acc, 0);
  res.status(200).json({ success: true, count: orders.length, totalAmount, orders });
});

// @desc   Admin - Update order status
// @route  PUT /api/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  order.orderStatus = req.body.status;
  if (req.body.status === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
  order.statusHistory.push({ status: req.body.status, note: req.body.note || `Order ${req.body.status}` });
  const updatedOrder = await order.save();
  res.status(200).json({ success: true, order: updatedOrder });
});

// @desc   Admin - Delete order
// @route  DELETE /api/orders/:id
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) { res.status(404); throw new Error('Order not found'); }
  await order.deleteOne();
  res.status(200).json({ success: true, message: 'Order deleted' });
});
