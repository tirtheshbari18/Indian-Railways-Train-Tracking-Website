import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Train } from '../types';
import { Link } from 'react-router-dom';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { CalendarClock, Search, ArrowRight, Clock, Filter } from 'lucide-react';

export const TrainTimetablePage: React.FC = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [dayFilter, setDayFilter] = useState<string>('ALL');

  const days = ["ALL", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const data = await api.trains.search({ limit: 100 });
        setTrains(data);
      } catch (err) {
        console.error("Timetable fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const filteredTrains = trains.filter((t) => {
    const matchesSearch =
      !search ||
      t.train_number.includes(search) ||
      t.train_name.toLowerCase().includes(search.toLowerCase()) ||
      t.source_station.name.toLowerCase().includes(search.toLowerCase()) ||
      t.destination_station.name.toLowerCase().includes(search.toLowerCase());

    const matchesDay = dayFilter === 'ALL' || t.operating_days.includes(dayFilter);

    return matchesSearch && matchesDay;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <CalendarClock className="w-6 h-6 text-railway-navy" />
          <span>National Railway Master Timetable</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Scheduled timetables, origin-departure timings, running duration and operating day charts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search train by number, name, or station..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-railway-navy focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Running Day:</span>
          <select
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-railway-navy"
          >
            {days.map((d) => (
              <option key={d} value={d}>{d === 'ALL' ? 'All Operating Days' : d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timetable Table */}
      {loading ? (
        <TableSkeleton rows={10} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-300 font-semibold">
                  <th className="py-3.5 px-4">Train No. & Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Origin / Dep</th>
                  <th className="py-3.5 px-4">Destination / Arr</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Distance</th>
                  <th className="py-3.5 px-4">Operating Days</th>
                  <th className="py-3.5 px-4">Classes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrains.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-500">
                      No trains matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTrains.map((t) => {
                    const hours = Math.floor(t.total_duration_minutes / 60);
                    const mins = t.total_duration_minutes % 60;

                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-mono font-bold text-xs bg-railway-navy text-white px-2 py-0.5 rounded inline-block mb-0.5">
                            {t.train_number}
                          </div>
                          <div className="font-bold text-slate-900">{t.train_name}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {t.train_category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-slate-900">{t.departure_time}</div>
                          <div className="text-[11px] text-slate-500 font-sans">{t.source_station.name} ({t.source_station.code})</div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-slate-900">{t.arrival_time}</div>
                          <div className="text-[11px] text-slate-500 font-sans">{t.destination_station.name} ({t.destination_station.code})</div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          {hours}h {mins}m
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-700">
                          {t.total_distance_km} km
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                          {t.operating_days}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                          {t.classes}
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <Link
                            to={`/live-status/${t.train_number}`}
                            className="text-railway-navy hover:text-railway-blue font-bold text-xs"
                          >
                            Track
                          </Link>
                          <span className="text-slate-300">|</span>
                          <Link
                            to={`/train-route?train=${t.train_number}`}
                            className="text-slate-600 hover:text-slate-900 font-medium text-xs"
                          >
                            Route
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
      )}
    </div>
  );
};
