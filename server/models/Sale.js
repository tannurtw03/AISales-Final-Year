const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    saleId: { type: String, required: true, unique: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, default: '' },
    category: { type: String, default: 'General', index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, default: 'Walk-in Customer' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking'], default: 'Cash' },
    date: { type: Date, required: true, default: Date.now, index: true },
    salesperson: { type: String, default: 'Sales Team' },
    branch: { type: String, default: 'Main Branch' }
  },
  { timestamps: true }
);

// Compound indexes for fast time-series aggregation
saleSchema.index({ date: 1, category: 1 });
saleSchema.index({ date: 1, productId: 1 });

module.exports = mongoose.model('Sale', saleSchema);
