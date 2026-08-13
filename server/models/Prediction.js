const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
  {
    forecastType: { type: String, enum: ['overall', 'category', 'product'], default: 'overall' },
    targetId: { type: String, default: 'ALL' }, // 'ALL' or Category Name or Product ID
    period: { type: String, enum: ['7d', '30d', '3m', '6m'], default: '30d' },
    historicalData: [
      {
        date: String,
        amount: Number,
        quantity: Number
      }
    ],
    forecastData: [
      {
        date: String,
        predictedAmount: Number,
        predictedQuantity: Number,
        confidenceLower: Number,
        confidenceUpper: Number
      }
    ],
    metrics: {
      mae: { type: Number, default: 0 },
      mse: { type: Number, default: 0 },
      rmse: { type: Number, default: 0 },
      r2: { type: Number, default: 0 },
      mape: { type: Number, default: 0 }
    },
    insights: [{ type: String }],
    modelUsed: { type: String, default: 'RandomForestRegressor' },
    trainedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
