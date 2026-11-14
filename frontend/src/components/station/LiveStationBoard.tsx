import React, { useState } from 'react';
import { StationTimetableEntry } from '../../types';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Props {
  timetable: StationTimetableEntry[];
  stationCode: string;
}

export const LiveStationBoard: React.FC<Props> = ({ timetable, stationCode }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'ARRIVALS' | 'DEPARTURES'>('ALL');

  const filtered = timetable.filter((item) => {
    if (filterType === 'ARRIVALS') {
      return item.destination_code === stationCode || item.scheduled_arrival;
    }
    if (filterType === 'DEPARTURES') {
      return item.source_code === stationCode || item.scheduled_departure;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header bar */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Station Arrivals & Departures Live Board</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time scheduled and expected train movements at {stationCode}
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'ALL' ? 'bg-railway-blue text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Trains
          </button>
          <button
            onClick={() => setFilterType('ARRIVALS')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'ARRIVALS' ? 'bg-railway-blue text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Arrivals
          </button>
          <button
            onClick={() => setFilterType('DEPARTURES')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterType === 'DEPARTURES' ? 'bg-railway-blue text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Departures
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3 px-4">Train</th>
              <th className="py-3 px-4">Origin → Destination</th>
              <th className="py-3 px-4">Arr / Dep</th>
              <th className="py-3 px-4">Halt</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Track</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No scheduled train movements found for selected filter.
                </td>
              </tr>
            ) : (
              filtered.map((item, index) => {
                const isOrigin = item.source_code === stationCode;
                const isDest = item.destination_code === stationCode;

                return (
                  <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                    {/* Train */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {item.train_number}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{item.train_name}</div>
                          <div className="text-[10px] text-slate-400">{item.train_category}</div>
                        </div>
                      </div>
                    </td>

                    {/* Origin -> Dest */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 font-medium">
                        {item.source_name} ({item.source_code})
                      </div>
                      <div className="text-slate-400 text-[10px] flex items-center gap-1">
                        <span>to</span>
                        <span className="text-slate-600 font-medium">{item.destination_name} ({item.destination_code})</span>
                      </div>
                    </td>

                    {/* Arr / Dep */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <div>
                        {isOrigin ? (
                          <span className="text-slate-400 text-[11px]">Originates</span>
                        ) : (
                          <span>Arr: {item.scheduled_arrival}</span>
                        )}
                      </div>
                      <div className="text-slate-600 text-[11px]">
                        {isDest ? (
                          <span className="text-slate-400">Terminates</span>
                        ) : (
                          <span>Dep: {item.scheduled_departure}</span>
                        )}
                      </div>
                    </td>

                    {/* Halt */}
                    <td className="py-3.5 px-4 text-slate-600">
                      {isOrigin || isDest ? '--' : `${item.halt_minutes}m`}
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-4">
                      {item.platform_number ? (
                        <span className="font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          PF {item.platform_number}
                        </span>
                      ) : (
                        <span className="text-slate-400">TBA</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/live-status/${item.train_number}`}
                        className="inline-flex items-center gap-1 text-railway-navy hover:text-railway-blue font-bold"
                      >
                        <span>Live</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
