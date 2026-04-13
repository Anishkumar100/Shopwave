const express = require('express');
const router = express.Router();
const { createCashfreeOrder, verifyPayment, cashfreeWebhook, getPaymentStatus, initiateRefund } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createCashfreeOrder);
router.post('/verify', protect, verifyPayment);
router.post('/webhook', cashfreeWebhook);
router.get('/status/:orderId', protect, getPaymentStatus);
router.post('/refund', protect, authorize('admin'), initiateRefund);

module.exports = router;
