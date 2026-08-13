const axios = require('axios');
const Sale = require('../models/Sale');
const Prediction = require('../models/Prediction');
const ModelMetrics = require('../models/ModelMetrics');
const Notification = require('../models/Notification');
const { emitEvent } = require('../services/socketService');

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

exports.trainModel = async (req, res) => {
  try {
    const { period = '30d', modelType = 'RandomForest' } = req.body;

    // Fetch all historical sales sorted by date
    const sales = await Sale.find().sort({ date: 1 });
    if (!sales || sales.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient sales records to train Machine Learning model. Please add or seed more sales records.'
      });
    }

    // Format sales data for Python FastAPI
    const salesPayload = sales.map((s) => ({
      saleId: s.saleId,
      date: s.date.toISOString().split('T')[0],
      totalAmount: s.totalAmount,
      quantity: s.quantity,
      category: s.category,
      productId: s.productId,
      price: s.price
    }));

    // Call Python ML FastAPI service
    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_API_URL}/ml/train`, {
        sales: salesPayload,
        period,
        modelType
      });
    } catch (err) {
      console.error('[ML API Error]', err.message);
      return res.status(503).json({
        success: false,
        message: `ML Service unavailable (${err.message}). Make sure Python FastAPI is running at ${ML_API_URL}.`
      });
    }

    const { forecastData, historicalData, metrics, insights, modelUsed } = mlResponse.data;

    // Store in ModelMetrics
    await ModelMetrics.create({
      modelName: modelUsed || modelType,
      mae: metrics.mae,
      mse: metrics.mse,
      rmse: metrics.rmse,
      r2: metrics.r2,
      mape: metrics.mape,
      sampleCount: sales.length
    });

    // Store Prediction Document
    const predictionDoc = await Prediction.create({
      forecastType: 'overall',
      targetId: 'ALL',
      period,
      historicalData,
      forecastData,
      metrics,
      insights,
      modelUsed: modelUsed || modelType
    });

    // Create Notification
    const notif = await Notification.create({
      title: 'AI Model Training Complete',
      message: `Model ${modelUsed} trained with R²=${metrics.r2.toFixed(2)} and MAE=₹${metrics.mae.toFixed(0)}.`,
      type: 'prediction',
      link: '/predictions'
    });

    emitEvent('prediction_completed', { prediction: predictionDoc, notification: notif });

    res.json({
      success: true,
      message: 'AI Model trained and sales forecast generated successfully.',
      prediction: predictionDoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPredictions = async (req, res) => {
  try {
    const { forecastType = 'overall', period = '30d' } = req.query;
    let prediction = await Prediction.findOne({ forecastType, period }).sort('-createdAt');

    // If no prediction for requested period, fallback to latest prediction or auto-trigger
    if (!prediction) {
      prediction = await Prediction.findOne().sort('-createdAt');
    }

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getModelMetrics = async (req, res) => {
  try {
    const metrics = await ModelMetrics.find().sort('-trainDate').limit(20);
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
