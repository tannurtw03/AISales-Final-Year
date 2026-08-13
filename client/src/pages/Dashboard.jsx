import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { StatCard } from '../components/common/StatCard';
import { SalesTrendChart } from '../components/charts/SalesTrendChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { TopProductsBarChart } from '../components/charts/TopProductsBarChart';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const Dashboard = () => {
  const { lastDashboardUpdate } = useSocket();

  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, trendRes, topRes, catRes, invRes, salesRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get(`/dashboard/sales-trend?period=${trendPeriod}`),
        api.get('/dashboard/top-products?limit=5'),
        api.get('/dashboard/category-performance'),
        api.get('/products/inventory-summary'),
        api.get('/sales?limit=5')
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (trendRes.data.success) setSalesTrend(trendRes.data.trend);
      if (topRes.data.success) setTopProducts(topRes.data.topProducts);
      if (catRes.data.success) setCategoryStats(catRes.data.categoryStats);
      if (invRes.data.success) setLowStockItems(invRes.data.lowStockItems);
      if (salesRes.data.success) setRecentSales(salesRes.data.sales);
    } catch (err) {
      console.error('[Dashboard Data Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [trendPeriod, lastDashboardUpdate]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Real-Time Business Analytics
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live DB
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real historical sales, stock levels & AI machine learning predictions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/predictions"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            AI Predictions
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Revenue"
          value={`₹${summary?.totalRevenue ? summary.totalRevenue.toLocaleString() : '0'}`}
          change={summary?.growthPercentage}
          subtext="vs Previous Month"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Total Sales"
          value={summary?.totalSales ? summary.totalSales.toLocaleString() : '0'}
          subtext={`${summary?.todaySales ? `₹${summary.todaySales.toLocaleString()} Today` : '₹0 Today'}`}
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Predicted Next Month"
          value={`₹${summary?.predictedNextMonthSales ? summary.predictedNextMonthSales.toLocaleString() : '0'}`}
          subtext="AI Forecasting Model"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Products Catalog"
          value={summary?.totalProducts || '0'}
          subtext={`${lowStockItems?.length || 0} Low Stock Alerts`}
          icon={Package}
          color="amber"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sales & Revenue Trend</h3>
              <p className="text-xs text-slate-500">Historical performance aggregated from MongoDB</p>
            </div>

            {/* Timeline Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              {['7d', '30d', '3m', '6m'].map((p) => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
                    trendPeriod === p ? 'bg-white text-blue-600 shadow' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <SalesTrendChart data={salesTrend} />
        </div>

        {/* Category Performance (1 col) */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Category Revenue Share</h3>
            <p className="text-xs text-slate-500 mb-4">Distribution by product category</p>
          </div>
          <CategoryPieChart data={categoryStats} />
        </div>
      </div>

      {/* Secondary Row: Top Products + Low Stock & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Top Performing Products</h3>
            <Link to="/products" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <TopProductsBarChart data={topProducts} />
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low Stock Alerts
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                {lowStockItems.length} Items
              </span>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                All products have healthy inventory levels.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.slice(0, 4).map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900">{item.productName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Min stock: {item.minimumStock}</p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.stock === 0
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.stock === 0 ? 'Out of Stock' : `${item.stock} Left`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/inventory"
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-xs font-semibold text-slate-700 text-center flex items-center justify-center gap-2 transition-colors"
          >
            Manage Inventory
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
              <Link to="/sales" className="text-xs font-semibold text-blue-600 hover:underline">
                View Sales
              </Link>
            </div>

            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.saleId}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{sale.productName}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {sale.customerName} • {new Date(sale.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-600">₹{sale.totalAmount?.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500">Qty: {sale.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/sales"
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-xs font-semibold text-slate-700 text-center flex items-center justify-center gap-2 transition-colors"
          >
            All Transactions
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
