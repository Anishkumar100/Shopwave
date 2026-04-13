const express = require('express');
const router = express.Router();
const { getProducts, getFeaturedProducts, getProduct, createProduct, updateProduct, deleteProduct, createReview, deleteReview, getAdminProducts } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/admin/all', protect, authorize('admin'), getAdminProducts);
router.post('/', protect, authorize('admin'), upload.array('images', 5), createProduct);
router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews', protect, createReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

module.exports = router;
