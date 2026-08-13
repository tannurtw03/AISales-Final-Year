import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogoIcon } from '../components/common/Logo';
import {
  User,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  AlertCircle,
  Save,
  Activity,
  Sparkles
} from 'lucide-react';

export const Profile = () => {
  const { user, updateUser } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const payload = { username, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Profile updated successfully!');
        if (res.data.user) {
          updateUser({ ...user, ...res.data.user });
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-100 text-rose-950 border-rose-300';
      case 'Manager':
        return 'bg-purple-100 text-purple-950 border-purple-300';
      default:
        return 'bg-blue-100 text-blue-950 border-blue-300';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto text-black">
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-slate-300 bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/90 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Icon */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-blue-500/25">
              {user?.username?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-black text-black tracking-tight">{user?.username}</h1>
              <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-black uppercase ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
            </div>
            <p className="text-xs font-bold text-black flex items-center justify-center sm:justify-start gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-black" />
              {user?.email}
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-black font-bold">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                Verified SmartSales AI User
              </span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-700" />
                Active Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-100 border border-rose-300 text-rose-950 text-xs font-bold flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Edit Profile & Password Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="glass-card rounded-3xl p-6 md:p-8 border border-slate-300 bg-white shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-black text-black flex items-center gap-2 mb-1">
                <User className="w-4.5 h-4.5 text-blue-700" />
                Personal Information
              </h2>
              <p className="text-xs font-bold text-black">Update your account name and email address</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5">Username</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-black" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-black font-bold focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <hr className="border-slate-200 my-4" />

            <div>
              <h2 className="text-base font-black text-black flex items-center gap-2 mb-1">
                <Key className="w-4.5 h-4.5 text-indigo-700" />
                Change Password
              </h2>
              <p className="text-xs font-bold text-black">Leave blank if you do not wish to change your password</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-black mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-black mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-black mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-slate-100 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-black font-bold placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition-all"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Account Details & Permissions Card */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-300 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-black text-black flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-700" />
              Role & Permissions
            </h3>
            
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black">Assigned Role:</span>
                <span className="font-black text-black">{user?.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black">AI Predictions:</span>
                <span className="font-black text-emerald-700">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black">Sales & Inventory:</span>
                <span className="font-black text-emerald-700">Full Access</span>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-black text-black">Platform Capabilities</h4>
              <ul className="text-xs text-black font-bold space-y-2">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  Real-time MongoDB Atlas change streams
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  RandomForest & XGBoost ML forecasting
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                  Automated sales target progress tracking
                </li>
              </ul>
            </div>
          </div>

          {/* SmartSales AI Branding Card */}
          <div className="glass-card rounded-3xl p-6 border border-slate-300 bg-white text-black shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <LogoIcon className="w-8 h-8" />
              <div>
                <p className="text-sm font-black tracking-tight text-black">SmartSales AI</p>
                <p className="text-[10px] text-blue-700 font-black uppercase tracking-wider">v1.0.0 Enterprise</p>
              </div>
            </div>
            <p className="text-xs text-black font-bold leading-relaxed">
              Powered by real-time WebSocket architecture and machine learning sales predictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
