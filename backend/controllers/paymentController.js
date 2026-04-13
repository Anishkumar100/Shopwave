const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const { Cashfree, initCashfree } = require('../config/cashfree');
const Order = require('../models/Order');

// Initialize Cashfree
initCashfree();

// @desc   Create Cashfree Order
// @route  POST /api/payment/create-order
exports.createCashfreeOrder = asyncHandler(async (req, res) => {
  const { orderId, amount, customerName, customerEmail, customerPhone } = req.body;

  const orderRequest = {
    order_id: orderId || `order_${uuidv4()}`,
    order_amount: parseFloat(amount),
    order_currency: 'INR',
    customer_details: {
      customer_id: req.user.id,
      customer_name: customerName || req.user.name,
      customer_email: customerEmail || req.user.email,
      customer_phone: customerPhone || '9999999999',
    },
    order_meta: {
      return_url: `${process.env.CLIENT_URL}/payment/verify?order_id={order_id}`,
      notify_url: `${process.env.CLIENT_URL?.replace('localhost:5173', 'localhost:5000')}/api/payment/webhook`,
    },
    order_note: 'ShopWave Order',
  };

  try {
    const response = await Cashfree.PGCreateOrder('2023-08-01', orderRequest);
    res.status(200).json({
      success: true,
      cfOrderId: response.data.cf_order_id,
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id,
      orderStatus: response.data.order_status,
    });
  } catch (error) {
    console.error('Cashfree Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error(error.response?.data?.message || 'Payment gateway error');
  }
});

// @desc   Verify Payment
// @route  POST /api/payment/verify
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, cfOrderId } = req.body;
  try {
    const response = await Cashfree.PGOrderFetchPayments('2023-08-01', orderId);
    const payments = response.data;
    const successPayment = payments.find(p => p.payment_status === 'SUCCESS');

    if (successPayment) {
      // Update order in DB
      const order = await Order.findOne({ 'paymentResult.orderId': orderId });
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.orderStatus = 'processing';
        order.paymentResult = {
          cfOrderId,
          orderId,
          paymentStatus: 'SUCCESS',
          paymentTime: successPayment.payment_completion_time,
          txId: successPayment.cf_payment_id,
        };
        order.statusHistory.push({ status: 'processing', note: 'Payment verified via Cashfree' });
        await order.save();
      }
      res.status(200).json({ success: true, paymentStatus: 'SUCCESS', payment: successPayment });
    } else {
      res.status(200).json({ success: false, paymentStatus: 'FAILED', payments });
    }
  } catch (error) {
    console.error('Verify Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Payment verification failed');
  }
});

// @desc   Cashfree Webhook
// @route  POST /api/payment/webhook
exports.cashfreeWebhook = asyncHandler(async (req, res) => {
  const { data, type } = req.body;
  console.log('Cashfree Webhook:', type, data);
  if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
    const { order } = data;
    await Order.findOneAndUpdate(
      { 'paymentResult.orderId': order.order_id },
      {
        isPaid: true,
        paidAt: Date.now(),
        orderStatus: 'processing',
        'paymentResult.paymentStatus': 'SUCCESS',
      }
    );
  }
  res.status(200).json({ success: true });
});

// @desc   Get payment status
// @route  GET /api/payment/status/:orderId
exports.getPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const response = await Cashfree.PGFetchOrder('2023-08-01', req.params.orderId);
    res.status(200).json({ success: true, order: response.data });
  } catch (error) {
    res.status(500); throw new Error('Could not fetch payment status');
  }
});

// @desc   Initiate Refund
// @route  POST /api/payment/refund
exports.initiateRefund = asyncHandler(async (req, res) => {
  const { orderId, refundAmount, refundNote } = req.body;
  const refundRequest = {
    refund_amount: refundAmount,
    refund_id: `refund_${uuidv4()}`,
    refund_note: refundNote || 'Customer requested refund',
  };
  try {
    const response = await Cashfree.PGOrderCreateRefund('2023-08-01', orderId, refundRequest);
    const order = await Order.findOne({ 'paymentResult.orderId': orderId });
    if (order) { order.orderStatus = 'refunded'; await order.save(); }
    res.status(200).json({ success: true, refund: response.data });
  } catch (error) {
    res.status(500); throw new Error('Refund initiation failed');
  }
});
