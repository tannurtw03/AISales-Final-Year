import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const ForecastChart = ({ historicalData = [], forecastData = [] }) => {
  if (!historicalData.length && !forecastData.length) {
    return (
      <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
        No forecasting dataset available. Click "Run ML Training" to generate prediction.
      </div>
    );
  }

  const combined = [];

  historicalData.forEach((item) => {
    combined.push({
      date: item.date,
      historical: item.amount,
      forecast: null,
      confidenceLower: null,
      confidenceUpper: null,
      confidenceRange: null
    });
  });

  forecastData.forEach((item) => {
    combined.push({
      date: item.date,
      historical: null,
      forecast: item.predictedAmount,
      confidenceLower: item.confidenceLower,
      confidenceUpper: item.confidenceUpper,
      confidenceRange: [item.confidenceLower, item.confidenceUpper]
    });
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1 text-slate-900">
          <p className="font-bold border-b border-slate-100 pb-1">{label}</p>
          {payload.find((p) => p.dataKey === 'historical') && (
            <p className="text-blue-600 font-bold">
              Historical Revenue: ₹{payload.find((p) => p.dataKey === 'historical').value?.toLocaleString()}
            </p>
          )}
          {payload.find((p) => p.dataKey === 'forecast') && (
            <>
              <p className="text-purple-600 font-bold">
                Predicted Revenue: ₹{payload.find((p) => p.dataKey === 'forecast').value?.toLocaleString()}
              </p>
              <p className="text-slate-500 text-[10px]">
                Confidence Band: ₹{payload[0]?.payload?.confidenceLower?.toLocaleString()} – ₹{payload[0]?.payload?.confidenceUpper?.toLocaleString()}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={combined} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
            formatter={(value) => <span className="text-slate-700 font-medium capitalize">{value}</span>}
          />
          
          <Area
            type="monotone"
            dataKey="confidenceRange"
            stroke="none"
            fill="url(#confidenceBand)"
            name="Confidence Interval (95%)"
          />

          <Line
            type="monotone"
            dataKey="historical"
            stroke="#2563eb"
            strokeWidth={3}
            dot={false}
            name="Historical Sales"
          />

          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#9333ea"
            strokeWidth={3}
            strokeDasharray="6 6"
            dot={{ r: 3, fill: '#9333ea' }}
            name="AI Forecasted Sales"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
