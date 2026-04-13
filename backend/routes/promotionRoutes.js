const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const c = require('../controllers/promotionController');

/* ==== Coupons ==== */
router.get('/coupons', c.getCoupons);
router.post('/coupons/validate', c.validateCoupon);
router.post('/coupons',     protect, authorize('admin'), c.createCoupon);
router.put('/coupons/:id',  protect, authorize('admin'), c.updateCoupon);
router.delete('/coupons/:id', protect, authorize('admin'), c.deleteCoupon);

/* ==== Flash Sale ==== */
router.get('/flash-sale', c.getFlashSale);
router.post('/flash-sale',    protect, authorize('admin'), c.createFlashSale);
router.put('/flash-sale/:id', protect, authorize('admin'), c.updateFlashSale);
router.delete('/flash-sale/:id', protect, authorize('admin'), c.deleteFlashSale);

/* ==== Bundles ==== */
router.get('/bundles', c.getBundles);
router.get('/bundles/admin', protect, authorize('admin'), c.getAllBundlesAdmin);
router.post('/bundles',    protect, authorize('admin'), c.createBundle);
router.put('/bundles/:id', protect, authorize('admin'), c.updateBundle);
router.delete('/bundles/:id', protect, authorize('admin'), c.deleteBundle);

module.exports = router;
