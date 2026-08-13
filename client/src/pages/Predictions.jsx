import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { ForecastChart } from '../components/charts/ForecastChart';
import { LogoIcon } from '../components/common/Logo';
import {
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Lightbulb
} from 'lucide-react';

export const Predictions = () => {
  const { lastDashboardUpdate } = useSocket();

  const [prediction, setPrediction] = useState(null);
  const [modelMetrics, setModelMetrics] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [modelType, setModelType] = useState('RandomForest');
  const [loading, setLoading] = useState(true);
  const [trainLoading, setTrainLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPredictionData = async () => {
    try {
      setLoading(true);
      const [predRes, metRes] = await Promise.all([
        api.get(`/predictions?period=${period}`),
        api.get('/predictions/metrics')
      ]);

      if (predRes.data.success) {
        setPrediction(predRes.data.prediction);
      }
      if (metRes.data.success) {
        setModelMetrics(metRes.data.metrics);
      }
    } catch (err) {
      console.error('[Prediction Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictionData();
  }, [period, lastDashboardUpdate]);

  const handleTrainModel = async () => {
    setMessage('');
    setError('');
    setTrainLoading(true);
    try {
      const res = await api.post('/predictions/train', { period, modelType });
      if (res.data.success) {
        setMessage(`AI Model trained successfully! (${res.data.prediction.modelUsed})`);
        setPrediction(res.data.prediction);
        fetchPredictionData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Model training failed.');
    } finally {
      setTrainLoading(false);
    }
  };

  const metrics = prediction?.metrics || { mae: 0, mse: 0, rmse: 0, r2: 0, mape: 0 };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-purple-50 via-white to-blue-50">
        <div className="flex items-center gap-4">
          <LogoIcon className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              AI Sales Forecasting & Machine Learning Engine
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Time-series regression models trained on MongoDB historical sales data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-purple-600 shadow-sm"
          >
            <option value="RandomForest">Random Forest Regressor</option>
            <option value="XGBoost">XGBoost / Gradient Boosting</option>
            <option value="LinearRegression">Linear Regression</option>
          </select>

          <button
            onClick={handleTrainModel}
            disabled={trainLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${trainLoading ? 'animate-spin' : ''}`} />
            {trainLoading ? 'Training ML Engine...' : 'Run ML Training & Forecast'}
          </button>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          {error}
        </div>
      )}

      {/* Model Evaluation Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 bg-white text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">R² Score (Accuracy)</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{(metrics.r2 * 100).toFixed(1)}%</p>
          <span className="text-[10px] text-slate-400">Goodness of Fit</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 bg-white text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MAE (Mean Error)</span>
          <p className="text-2xl font-black text-blue-600 mt-1">₹{metrics.mae?.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Average Abs Error</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 bg-white text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">RMSE</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{metrics.rmse?.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400">Root Mean Sq Error</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 bg-white text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">MAPE</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{metrics.mape}%</p>
          <span className="text-[10px] text-slate-400">Percentage Error</span>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-200 bg-white text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active ML Model</span>
          <p className="text-sm font-black text-slate-900 truncate mt-2">{prediction?.modelUsed || 'RandomForest'}</p>
          <span className="text-[10px] text-slate-400">Python Scikit-Learn</span>
        </div>
      </div>

      {/* Main Forecast Visualization */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Sales Forecast & Confidence Bands
            </h3>
            <p className="text-xs text-slate-500">
              Blue line: Historical sales | Dashed Purple line: AI Forecast | Shaded region: 95% Confidence Interval
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            {['7d', '30d', '3m', '6m'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                  period === p ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <ForecastChart
          historicalData={prediction?.historicalData || []}
          forecastData={prediction?.forecastData || []}
        />
      </div>

      {/* AI Business Insights Feed */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          AI Business Insights & Actionable Advice
        </h3>

        {!prediction?.insights || prediction.insights.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Click "Run ML Training & Forecast" to synthesize AI recommendations from sales trends.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prediction.insights.map((insight, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed flex items-start gap-3"
              >
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
