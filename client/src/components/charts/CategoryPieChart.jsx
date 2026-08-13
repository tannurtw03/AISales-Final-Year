import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#9333ea', '#f59e0b', '#ec4899', '#06b6d4'];

export const CategoryPieChart = ({ data = [] }) => {
  if (!data.length) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-xs">No category data</div>;
  }

  const formatted = data.map((item) => ({
    name: item._id || item.category,
    value: item.totalRevenue || 0
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xl text-xs text-slate-900">
          <p className="font-bold">{payload[0].name}</p>
          <p className="text-emerald-600 font-bold mt-0.5">
            ₹{payload[0].value?.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {formatted.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-slate-700 text-xs font-semibold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
