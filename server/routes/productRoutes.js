const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getInventorySummary
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/inventory-summary', protect, getInventorySummary);
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);
router.post('/', protect, authorize('Admin', 'Manager'), createProduct);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateProduct);
router.delete('/:id', protect, authorize('Admin'), deleteProduct);

module.exports = router;
