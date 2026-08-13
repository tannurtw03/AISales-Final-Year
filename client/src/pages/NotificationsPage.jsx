import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Bell, Check, Trash2, ShoppingCart, AlertTriangle, TrendingUp, Target } from 'lucide-react';

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const { setUnreadNotifsCount } = useSocket();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadNotifsCount(0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async () => {
    try {
      await api.put('/notifications/read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    try {
      await api.delete('/notifications/clear');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'sale':
        return <ShoppingCart className="w-5 h-5 text-emerald-600" />;
      case 'stock':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'prediction':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'target':
        return <Target className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Notifications Feed</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time alerts for sales transactions, stock limits & ML predictions</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAsRead}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            Mark All Read
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear Feed
          </button>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-slate-200 bg-white divide-y divide-slate-100 overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No system notifications in your feed.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                !notif.read ? 'bg-blue-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm">{notif.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
