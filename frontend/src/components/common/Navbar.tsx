import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Train,
  Compass,
  MapPin,
  GitCompare,
  Activity,
  User,
  Shield,
  Menu,
  X,
  LogOut,
  Radio,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Live Status', path: '/live-status', icon: Radio, highlight: true },
    { name: 'Train Search', path: '/train-search', icon: Search },
    { name: 'Route Details', path: '/train-route', icon: Compass },
    { name: 'Station Directory', path: '/stations', icon: MapPin },
    { name: 'Compare Trains', path: '/comparison', icon: GitCompare },
    { name: 'Railway Map', path: '/railway-map', icon: Activity },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-railway-dark/95 backdrop-blur border-b border-slate-800 text-white">
      {/* Top Banner with Service Notice */}
      <div className="bg-gradient-to-r from-railway-navy via-slate-900 to-railway-navy px-4 py-1 text-xs border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">National Rail Tracking Operations System</span>
            <span className="hidden md:inline text-slate-500">•</span>
            <span className="hidden md:inline text-slate-400 text-[11px]">CRIS / NTES Telemetry Telematics Active</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <Link to="/system-status" className="hover:text-slate-200 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>API Status: Normal</span>
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-railway-accent font-semibold flex items-center gap-1 hover:underline">
                <Shield className="w-3 h-3" />
                <span>Admin Console</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-railway-navy to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-900/40 group-hover:scale-105 transition-transform border border-blue-400/20">
              <Train className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                <span>RailTrack</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-railway-accent text-white font-mono uppercase">
                  India
                </span>
              </div>
              <div className="text-[10px] text-slate-400 -mt-0.5 font-medium tracking-wide">
                Train Telemetry & Journey Intelligence
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-railway-blue text-white shadow-sm'
                      : link.highlight
                      ? 'text-amber-300 hover:bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? 'text-amber-400 animate-pulse' : ''}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile / Auth Area */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-railway-blue flex items-center justify-center text-white text-xs font-bold">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user.full_name || user.email}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-railway-accent hover:bg-orange-600 text-white px-3.5 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.path)
                    ? 'bg-railway-blue text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-sm text-slate-200"
                >
                  <User className="w-4 h-4 text-railway-blue" />
                  <span>{user.full_name || user.email} (My Profile)</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-sm text-railway-accent"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-lg text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 rounded-lg border border-slate-700 text-slate-200 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 rounded-lg bg-railway-accent text-white text-sm font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
