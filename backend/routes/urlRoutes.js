const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Create short URL
router.post('/create', authMiddleware, urlController.createShortUrl);

// Get user's URLs
router.get('/myurls', authMiddleware, urlController.getUserUrls);

// Delete URL by id
router.delete('/:id', authMiddleware, urlController.deleteUrl);

// Public redirect by shortCode (keep after other /api/url routes)
// Analytics (protected)
router.get('/:id/analytics', authMiddleware, analyticsController.getAnalytics);

// Download QR (protected)
router.get('/:id/qr', authMiddleware, urlController.downloadQR);

// Public redirect by shortCode (keep after other /api/url routes)
router.get('/:shortCode', urlController.redirectUrl);

module.exports = router;
