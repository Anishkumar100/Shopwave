const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { uploadBuffer, isConfigured } = require('../config/cloudinary');

// POST /api/upload — multi-image upload via Cloudinary
router.post('/', protect, authorize('admin'), upload.array('images', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    // Cloudinary path
    if (isConfigured()) {
      const results = await Promise.all(
        req.files.map((f) => uploadBuffer(f.buffer, 'shopwave/products'))
      );
      const files = results.map((r) => ({
        public_id: r.public_id,
        url: r.secure_url,
      }));
      return res.status(200).json({ success: true, files, provider: 'cloudinary' });
    }

    // Fallback: base64 data URLs (dev only, not recommended for production)
    const files = req.files.map((f) => ({
      public_id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      url: `data:${f.mimetype};base64,${f.buffer.toString('base64')}`,
    }));
    return res.status(200).json({ success: true, files, provider: 'base64-fallback' });
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
  }
});

module.exports = router;
