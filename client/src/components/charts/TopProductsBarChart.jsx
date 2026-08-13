import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const TopProductsBarChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No product performance data</div>;
  }

  const formatted = data.map((item) => ({
    name: item.productName ? (item.productName.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName) : item._id,
    revenue: item.totalRevenue || 0,
    quantity: item.totalQuantity || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xl text-xs text-slate-900">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-blue-600 font-bold">Revenue: ₹{payload[0].value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={110} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" fill="#2563eb" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
