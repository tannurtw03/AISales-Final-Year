const mongoose = require('mongoose');

const modelMetricsSchema = new mongoose.Schema(
  {
    modelName: { type: String, required: true },
    mae: { type: Number, required: true },
    mse: { type: Number, required: true },
    rmse: { type: Number, required: true },
    r2: { type: Number, required: true },
    mape: { type: Number, required: true },
    trainDate: { type: Date, default: Date.now },
    featuresUsed: [{ type: String }],
    sampleCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ModelMetrics', modelMetricsSchema);
