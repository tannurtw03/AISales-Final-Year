const express = require('express');
const router = express.Router();
const {
  getSummary,
  getSalesTrend,
  getTopProducts,
  getCategoryPerformance
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/sales-trend', protect, getSalesTrend);
router.get('/top-products', protect, getTopProducts);
router.get('/category-performance', protect, getCategoryPerformance);

module.exports = router;
