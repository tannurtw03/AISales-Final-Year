import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/common/StatCard';
import { Boxes, AlertTriangle, CheckCircle, DollarSign, TrendingUp, ShieldCheck } from 'lucide-react';

export const Inventory = () => {
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [fastMoving, setFastMoving] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [invRes, topRes] = await Promise.all([
        api.get('/products/inventory-summary'),
        api.get('/dashboard/top-products?limit=10')
      ]);

      if (invRes.data.success) {
        setSummary(invRes.data.summary);
        setLowStockItems(invRes.data.lowStockItems);
      }
      if (topRes.data.success) {
        setFastMoving(topRes.data.topProducts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inventory Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Stock valuation, automated low-stock threshold triggers & movement analytics
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Stock Value"
          value={`₹${summary?.totalValue ? summary.totalValue.toLocaleString() : '0'}`}
          subtext="Inventory Asset Valuation"
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Healthy Stock Items"
          value={summary?.inStock || '0'}
          subtext="Above Minimum Threshold"
          icon={CheckCircle}
          color="blue"
        />
        <StatCard
          title="Low Stock Warning"
          value={summary?.lowStock || '0'}
          subtext="Requires Replenishment"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Out of Stock"
          value={summary?.outOfStock || '0'}
          subtext="Critical Replenishment"
          icon={Boxes}
          color="purple"
        />
      </div>

      {/* Main Grid: Low Stock Alert List & Fast Moving Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Stock Replenishment Alerts
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Triggered automatically when Current Stock &lt; Minimum Stock
          </p>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Zero inventory warnings. All product levels are optimal!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Category: {item.category} • Supplier: {item.supplier}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-700">
                      Stock: {item.stock} / Min: {item.minimumStock}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        item.stock === 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.stock === 0 ? (
                        'Out of Stock'
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Low Stock
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fast Moving Products */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white shadow-sm">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Fast Moving Products
          </h3>
          <p className="text-xs text-slate-500 mb-4">Highest volume and sales velocity items</p>

          <div className="space-y-3">
            {fastMoving.map((item, idx) => (
              <div
                key={item._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.productName}</h4>
                    <p className="text-[10px] text-slate-500">{item.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-extrabold text-emerald-600">₹{item.totalRevenue?.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">{item.totalQuantity} Units Sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
