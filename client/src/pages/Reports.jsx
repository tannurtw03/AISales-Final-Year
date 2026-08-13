import React, { useState } from 'react';
import api from '../services/api';
import { Download, Printer, FileText } from 'lucide-react';

export const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ reportType });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/reports?${params.toString()}`);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const params = new URLSearchParams({ reportType, format: 'csv' });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/reports?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('CSV download failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0 print:bg-white print:text-black">
      {/* Non-printable Controls */}
      <div className="print:hidden space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Business Reports & Export</h1>
          <p className="text-xs text-slate-500 mt-1">Generate comprehensive business reports in CSV or printable PDF format</p>
        </div>

        {/* Report Selector Card */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200 bg-white space-y-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Report Module</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="sales">Daily / Monthly Sales Report</option>
                <option value="inventory">Inventory Asset Valuation Report</option>
                <option value="prediction">AI Forecasting Summary Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
            >
              <FileText className="w-4 h-4" />
              {loading ? 'Generating...' : 'Generate Report View'}
            </button>

            {reportData && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  <Printer className="w-4 h-4" />
                  Print PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formatted Report View Container */}
      {reportData && (
        <div className="glass-card rounded-3xl p-8 border border-slate-200 bg-white text-slate-900 print:border-none print:shadow-none space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 capitalize">
                SmartSales AI - {reportData.reportType} Report
              </h2>
              <p className="text-xs text-slate-500">Generated on {new Date().toLocaleString()}</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Branch: Main Headquarters</p>
              <p>Status: Verified Official Report</p>
            </div>
          </div>

          {/* Summary Box */}
          {reportData.summary && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              {Object.entries(reportData.summary).map(([key, val]) => (
                <div key={key}>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">{key}</span>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {typeof val === 'number' ? `₹${val.toLocaleString()}` : val}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Sales Report Table */}
          {reportData.sales && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2">Sale ID</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Product</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {reportData.sales.map((s) => (
                  <tr key={s._id}>
                    <td className="py-2 font-mono text-blue-600 font-bold">{s.saleId}</td>
                    <td className="py-2 text-slate-500">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="py-2 font-semibold text-slate-900">{s.productName}</td>
                    <td className="py-2 text-center font-bold">{s.quantity}</td>
                    <td className="py-2 text-right">₹{s.price?.toLocaleString()}</td>
                    <td className="py-2 text-right font-extrabold text-emerald-600">
                      ₹{s.totalAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Inventory Report Table */}
          {reportData.products && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="py-2">Product ID</th>
                  <th className="py-2">Product Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-center">Stock</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {reportData.products.map((p) => (
                  <tr key={p._id}>
                    <td className="py-2 font-mono text-blue-600 font-bold">{p.productId}</td>
                    <td className="py-2 font-semibold text-slate-900">{p.productName}</td>
                    <td className="py-2 text-slate-500">{p.category}</td>
                    <td className="py-2 text-right font-bold">₹{p.price?.toLocaleString()}</td>
                    <td className="py-2 text-center font-bold">{p.stock}</td>
                    <td className="py-2 font-bold">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
