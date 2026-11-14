import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Radio,
  Route,
  MapPin,
  Building2,
  CalendarClock,
  GitCompare,
  Map,
  User,
  Shield,
  Server,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = () => {
  const { user, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Train Search', to: '/train-search', icon: Search },
    { name: 'Live Train Tracker', to: '/live-status', icon: Radio, pulse: true },
    { name: 'Route Timeline', to: '/train-route', icon: Route },
    { name: 'Station Directory', to: '/stations', icon: MapPin },
    { name: 'Station Live Board', to: '/stations/NDLS', icon: Building2 },
    { name: 'Train Timetable', to: '/timetable', icon: CalendarClock },
    { name: 'Train Comparison', to: '/comparison', icon: GitCompare },
    { name: 'National Rail Map', to: '/railway-map', icon: Map },
  ];

  const userPages = [
    { name: 'User Profile & Favs', to: '/profile', icon: User },
    ...(isAdmin ? [{ name: 'Admin Dashboard', to: '/admin', icon: Shield, badge: 'STAFF' }] : []),
    { name: 'API & System Health', to: '/system-status', icon: Server },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations & Tracking
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-railway-blue text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${item.pulse ? 'text-emerald-400 animate-pulse' : ''}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.pulse && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account & System
          </div>
          <nav className="space-y-1">
            {userPages.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-railway-blue text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Quick Simulation Trigger & Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Operations Feed</span>
        </div>
        <p className="text-[11px] text-slate-400 mb-3">
          12 Active Trunk Lines monitored via GPS telemetry.
        </p>
        <NavLink
          to="/live-status"
          className="block w-full py-1.5 px-3 text-center text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
        >
          Track Live Express →
        </NavLink>
      </div>
    </aside>
  );
};
