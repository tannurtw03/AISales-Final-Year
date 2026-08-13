const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// @route   GET /api/customers
// @desc    Get all Indian Enterprise Customers
// @access  Public / Protected
router.get('/', async (req, res, next) => {
  try {
    const customers = await Customer.find({}).sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer details
router.get('/:id', async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id }) || await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
