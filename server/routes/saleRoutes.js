const express = require('express');
const router = express.Router();
const {
  getSales,
  getSaleById,
  createSale,
  updateSale,
  deleteSale
} = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getSales);
router.get('/:id', protect, getSaleById);
router.post('/', protect, createSale);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateSale);
router.delete('/:id', protect, authorize('Admin'), deleteSale);

module.exports = router;
