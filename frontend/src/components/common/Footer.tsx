import React from 'react';
import { Link } from 'react-router-dom';
import { Train, ShieldCheck, Heart, Radio, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-railway-navy flex items-center justify-center text-white">
                <Train className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-white text-base">RailTrack India</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              National Indian Railways real-time train tracking, timetable inspection, route telemetry, and station information portal.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px] font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Network Feed: Operational</span>
            </div>
          </div>

          {/* Quick Tracking */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Train Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/live-status/22436" className="hover:text-white transition-colors">Vande Bharat Express (22436)</Link></li>
              <li><Link to="/live-status/12002" className="hover:text-white transition-colors">Bhopal Shatabdi Express (12002)</Link></li>
              <li><Link to="/live-status/12951" className="hover:text-white transition-colors">Mumbai Tejas Rajdhani (12951)</Link></li>
              <li><Link to="/live-status/12301" className="hover:text-white transition-colors">Howrah Rajdhani Express (12301)</Link></li>
              <li><Link to="/live-status/20901" className="hover:text-white transition-colors">Gandhinagar Vande Bharat (20901)</Link></li>
            </ul>
          </div>

          {/* Major Stations */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Key Junctions
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/stations/NDLS" className="hover:text-white transition-colors">New Delhi Junction (NDLS)</Link></li>
              <li><Link to="/stations/CSMT" className="hover:text-white transition-colors">Mumbai CSMT (CSMT)</Link></li>
              <li><Link to="/stations/HWH" className="hover:text-white transition-colors">Howrah Junction (HWH)</Link></li>
              <li><Link to="/stations/MAS" className="hover:text-white transition-colors">MGR Chennai Central (MAS)</Link></li>
              <li><Link to="/stations/SBC" className="hover:text-white transition-colors">KSR Bengaluru City (SBC)</Link></li>
            </ul>
          </div>

          {/* System & Compliance */}
          <div>
            <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">
              Platform & Data
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/system-status" className="hover:text-white transition-colors">System Health & APIs</Link></li>
              <li><Link to="/timetable" className="hover:text-white transition-colors">Master Timetable Grid</Link></li>
              <li><Link to="/comparison" className="hover:text-white transition-colors">Train Fleet Comparison</Link></li>
              <li><Link to="/railway-map" className="hover:text-white transition-colors">Interactive Geographic Map</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Passenger & Admin Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Data displayed is strictly categorised as verified live data, scheduled timetable, or simulated demonstration feed.
            </span>
          </div>
          <div>
            © 2026 RailTrack India • Built with FastAPI, React, TypeScript & Leaflet
          </div>
        </div>
      </div>
    </footer>
  );
};
