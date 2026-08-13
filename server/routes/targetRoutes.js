const express = require('express');
const router = express.Router();
const { getTargets, createTarget, updateTarget, deleteTarget } = require('../controllers/targetController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTargets);
router.post('/', protect, authorize('Admin', 'Manager'), createTarget);
router.put('/:id', protect, authorize('Admin', 'Manager'), updateTarget);
router.delete('/:id', protect, authorize('Admin'), deleteTarget);

module.exports = router;
