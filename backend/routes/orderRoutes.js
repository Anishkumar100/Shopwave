const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, updateOrderToPaid, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/admin', protect, authorize('admin'), getAllOrders);
router.route('/:id').get(protect, getOrder).delete(protect, authorize('admin'), deleteOrder);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
