const mongoose = require('mongoose');

const salesTargetSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    branch: { type: String, default: 'All Branches' },
    status: { type: String, enum: ['In Progress', 'Achieved', 'Expired'], default: 'In Progress' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SalesTarget', salesTargetSchema);
