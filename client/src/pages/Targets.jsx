import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Modal } from '../components/common/Modal';
import { Target, Plus, Trash2 } from 'lucide-react';

export const Targets = () => {
  const [targets, setTargets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState(1000000);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [branch, setBranch] = useState('All Branches');
  const [loading, setLoading] = useState(true);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/targets');
      if (res.data.success) {
        setTargets(res.data.targets);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleCreateTarget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/targets', {
        title,
        targetAmount: Number(targetAmount),
        startDate,
        endDate,
        branch
      });
      setModalOpen(false);
      fetchTargets();
    } catch (err) {
      alert('Failed to create sales target');
    }
  };

  const handleDeleteTarget = async (id) => {
    if (!window.confirm('Delete target?')) return;
    try {
      await api.delete(`/targets/${id}`);
      fetchTargets();
    } catch (err) {
      alert('Delete target failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Goals & Targets</h1>
          <p className="text-xs text-slate-500 mt-1">Set monthly and quarterly sales revenue goals for teams</p>
        </div>

        <button
          onClick={() => {
            setTitle('Monthly Sales Target Q3');
            const now = new Date();
            setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
            setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Sales Target
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {targets.map((tgt) => {
          const pct = Math.min(100, Math.round((tgt.currentAmount / tgt.targetAmount) * 100));
          return (
            <div key={tgt._id} className="glass-card rounded-3xl p-6 border border-slate-200 bg-white shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    {tgt.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(tgt.startDate).toLocaleDateString()} – {new Date(tgt.endDate).toLocaleDateString()} • {tgt.branch}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      tgt.status === 'Achieved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {tgt.status}
                  </span>
                  <button
                    onClick={() => handleDeleteTarget(tgt._id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-700">Achieved: ₹{tgt.currentAmount?.toLocaleString()}</span>
                  <span className="text-blue-600">{pct}% Goal</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Start: ₹0</span>
                  <span>Target Goal: ₹{tgt.targetAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Sales Target Goal">
        <form onSubmit={handleCreateTarget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q3 Regional Revenue Goal"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Amount (₹) *</label>
            <input
              type="number"
              min="1000"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20"
            >
              Save Target
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
