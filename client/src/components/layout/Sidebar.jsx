import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Boxes,
  TrendingUp,
  FileSpreadsheet,
  Target,
  Bell,
  Users
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Sales', path: '/sales', icon: ShoppingCart },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Inventory', path: '/inventory', icon: Boxes },
    { label: 'AI Predictions', path: '/predictions', icon: TrendingUp, highlight: true },
    { label: 'Sales Targets', path: '/targets', icon: Target },
    { label: 'Reports', path: '/reports', icon: FileSpreadsheet },
    { label: 'Notifications', path: '/notifications', icon: Bell }
  ];

  if (user?.role === 'Admin') {
    navItems.push({ label: 'Users & Roles', path: '/users', icon: Users });
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center border-b border-slate-200 sticky top-0 bg-white z-10">
          <Logo size="md" showSubtitle={true} linkTo="/dashboard" />
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-purple-100 text-purple-700 border border-purple-200">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
