import React from 'react';
import { LiveStatus } from '../../types';
import { LiveStatusBadge } from '../common/LiveStatusBadge';
import {
  Gauge,
  Navigation2,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Props {
  status: LiveStatus;
  onSimulateTick?: () => void;
  isSimulating?: boolean;
}

export const RunningTracker: React.FC<Props> = ({
  status,
  onSimulateTick,
  isSimulating = false
}) => {
  const isDelayed = status.delay_minutes > 15;
  const isTerminated = status.status.toLowerCase() === 'terminated' || status.status.toLowerCase() === 'arrived';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      {/* Header bar with Status & Data Freshness */}
      <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-railway-accent text-white">
              {status.train_number}
            </span>
            <span className="text-sm font-bold text-slate-200">{status.train_name}</span>
          </div>
          <div className="text-xs text-slate-400">
            {status.source_station.name} ({status.source_station.code}) → {status.destination_station.name} ({status.destination_station.code})
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LiveStatusBadge
            dataSourceType={status.data_source_type}
            isLiveVerified={status.is_live_verified}
            size="lg"
          />
          {onSimulateTick && (
            <button
              onClick={onSimulateTick}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
              title="Advance train simulation position"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>Advance Step</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Metrics 4-Col Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-50/50 border-b border-slate-200">
        {/* Speed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Reported Speed</span>
            <Gauge className="w-4 h-4 text-railway-blue" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {status.current_speed_kmh} <span className="text-xs font-normal text-slate-500">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Telemetry GPS speed
          </div>
        </div>

        {/* Delay */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Delay Status</span>
            <Clock className={`w-4 h-4 ${isDelayed ? 'text-rose-500' : 'text-emerald-500'}`} />
          </div>
          <div className={`text-2xl font-extrabold font-mono ${isDelayed ? 'text-rose-600' : 'text-emerald-600'}`}>
            {status.delay_minutes === 0 ? 'On Time' : `+${status.delay_minutes} min`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isDelayed ? 'Late running reported' : 'Punctual transit'}
          </div>
        </div>

        {/* Distance Covered */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Distance Covered</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {status.distance_covered_km} <span className="text-xs font-normal text-slate-500">km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Remaining: <b>{status.distance_remaining_km} km</b>
          </div>
        </div>

        {/* Progress % */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase">Journey Progress</span>
            <Navigation2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {status.progress_percentage}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Status: <b className="text-slate-700">{status.status}</b>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-6">
        <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
          <span>{status.source_station.name} ({status.source_station.code})</span>
          <span>{status.destination_station.name} ({status.destination_station.code})</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-railway-navy via-railway-blue to-railway-accent rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(0, status.progress_percentage))}%` }}
          />
        </div>

        {/* Last Reported vs Next Station Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Last Reported Station
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-slate-900">
                  {status.last_reported_station?.name || status.source_station.name}
                </span>
                <span className="ml-2 font-mono text-xs font-bold text-railway-navy bg-blue-100 px-1.5 py-0.5 rounded">
                  {status.last_reported_station?.code || status.source_station.code}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-[10px] uppercase font-bold text-blue-600 block mb-1">
              Next Scheduled Station
            </span>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-bold text-slate-900">
                  {status.next_scheduled_station?.name || status.destination_station.name}
                </span>
                <span className="ml-2 font-mono text-xs font-bold text-railway-accent bg-orange-100 px-1.5 py-0.5 rounded">
                  {status.next_scheduled_station?.code || status.destination_station.code}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-railway-blue" />
            </div>
          </div>
        </div>

        {/* Notice on Data Freshness */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400">
          <span>
            Provider: <b className="text-slate-600">{status.data_source_name}</b>
          </span>
          <span>
            Last Reported: <b className="font-mono text-slate-600">{new Date(status.last_updated).toLocaleTimeString()}</b>
          </span>
        </div>
      </div>
    </div>
  );
};
