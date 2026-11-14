import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Clock, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Stop {
  sequence: number;
  station_code: string;
  station_name: string;
  hindi_name?: string;
  state: string;
  zone?: string;
  scheduled_arrival?: string;
  scheduled_departure?: string;
  halt_minutes: number;
  distance_from_source_km: number;
  distance_from_previous_km: number;
  day_number: number;
  platform_number?: string;
}

interface Props {
  stops: Stop[];
}

export const RouteTimeline: React.FC<Props> = ({ stops }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  if (!stops || stops.length === 0) {
    return <div className="text-sm text-slate-500 p-4">No route stops available.</div>;
  }

  // If collapsed, only show first, middle and last
  const displayStops = collapsed && stops.length > 4
    ? [stops[0], ...stops.slice(1, -1).filter((_, i) => i === 0 || i === Math.floor(stops.length / 2)), stops[stops.length - 1]]
    : stops;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Route & Halt Schedule</h3>
          <p className="text-xs text-slate-500">
            Total {stops.length} designated stations with halt timings and platforms
          </p>
        </div>
        {stops.length > 4 && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          >
            {collapsed ? (
              <>
                <span>Expand All ({stops.length})</span>
                <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Collapse Intermediate</span>
                <ChevronUp className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {displayStops.map((stop, index) => {
          const isOrigin = stop.sequence === 1;
          const isDestination = stop.sequence === stops.length;

          return (
            <div key={stop.sequence} className="relative flex flex-col md:flex-row md:items-center justify-between gap-3 group">
              {/* Point Node */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-125 ${
                  isOrigin
                    ? 'bg-emerald-600 ring-2 ring-emerald-200'
                    : isDestination
                    ? 'bg-rose-600 ring-2 ring-rose-200'
                    : 'bg-blue-600 ring-2 ring-blue-200'
                }`}
              />

              {/* Station Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/stations/${stop.station_code}`}
                    className="font-bold text-slate-900 hover:text-railway-blue transition-colors text-sm"
                  >
                    {stop.station_name}
                  </Link>
                  <span className="font-mono text-xs font-bold text-railway-accent bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                    {stop.station_code}
                  </span>
                  {stop.hindi_name && (
                    <span className="text-xs text-slate-400 font-sans hidden sm:inline">
                      ({stop.hindi_name})
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                  <span>Day {stop.day_number}</span>
                  <span>•</span>
                  <span>{stop.distance_from_source_km} km from origin</span>
                  {stop.distance_from_previous_km > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-slate-400">+{stop.distance_from_previous_km} km</span>
                    </>
                  )}
                </div>
              </div>

              {/* Timing & Halt */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-3 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Arr</span>
                    <span className="font-bold text-slate-800">
                      {stop.scheduled_arrival || '--'}
                    </span>
                  </div>
                  <div className="text-slate-300">|</div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Dep</span>
                    <span className="font-bold text-slate-800">
                      {stop.scheduled_departure || '--'}
                    </span>
                  </div>
                </div>

                {stop.halt_minutes > 0 && (
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 font-sans">
                    <Clock className="w-3 h-3 text-blue-500" />
                    <span>{stop.halt_minutes}m halt</span>
                  </div>
                )}

                {stop.platform_number && (
                  <div className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded text-[11px] font-bold font-sans">
                    PF {stop.platform_number}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
