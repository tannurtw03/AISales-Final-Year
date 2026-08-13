import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, change, subtext, icon: Icon, color = 'blue' }) => {
  const isPositive = change >= 0;

  const colorStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-slate-200 bg-white flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.blue}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {change !== undefined && change !== null ? (
          <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? `+${change}%` : `${change}%`}</span>
          </div>
        ) : null}
        {subtext && <span className="text-slate-500 font-medium">{subtext}</span>}
      </div>
    </div>
  );
};
