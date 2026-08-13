const express = require('express');
const router = express.Router();
const {
  trainModel,
  getPredictions,
  getModelMetrics
} = require('../controllers/predictionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/train', protect, authorize('Admin', 'Manager'), trainModel);
router.get('/', protect, getPredictions);
router.get('/metrics', protect, getModelMetrics);

module.exports = router;
