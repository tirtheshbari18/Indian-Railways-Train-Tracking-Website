import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Train } from '../types';
import { TrainCard } from '../components/train/TrainCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Search, Filter, RefreshCw, SlidersHorizontal, Train as TrainIcon } from 'lucide-react';

export const TrainSearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [sourceCode, setSourceCode] = useState(searchParams.get('source_code') || '');
  const [destCode, setDestCode] = useState(searchParams.get('destination_code') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [operatingDay, setOperatingDay] = useState(searchParams.get('operating_day') || 'ALL');
  const [departureTime, setDepartureTime] = useState(searchParams.get('departure_time_range') || 'ALL');

  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    "ALL",
    "Vande Bharat",
    "VB Sleeper",
    "Amrit Bharat",
    "Rajdhani",
    "Shatabdi",
    "Superfast",
    "Mail / Express",
    "Weekly Superfast",
    "Duronto",
    "MEMU",
    "DEMU",
    "EMU Local",
    "Passenger",
  ];
  const days = ["ALL", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeRanges = [
    { label: "All Day", value: "ALL" },
    { label: "Morning (06:00 - 12:00)", value: "morning" },
    { label: "Afternoon (12:00 - 17:00)", value: "afternoon" },
    { label: "Evening (17:00 - 21:00)", value: "evening" },
    { label: "Night (21:00 - 06:00)", value: "night" },
  ];

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const data = await api.trains.search({
        query: query || undefined,
        source_code: sourceCode || undefined,
        destination_code: destCode || undefined,
        category: category !== 'ALL' ? category : undefined,
        operating_day: operatingDay !== 'ALL' ? operatingDay : undefined,
        departure_time_range: departureTime !== 'ALL' ? departureTime : undefined,
      });
      setTrains(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [category, operatingDay, departureTime]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrains();
  };

  const handleResetFilters = () => {
    setQuery('');
    setSourceCode('');
    setDestCode('');
    setCategory('ALL');
    setOperatingDay('ALL');
    setDepartureTime('ALL');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <TrainIcon className="w-6 h-6 text-railway-navy" />
          <span>Indian Railways Train Search Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search trains by number, name, category, or origin-destination stations with precision filters.
        </p>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Main search text inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Train Number / Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. 22436, Shatabdi"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Station Code
              </label>
              <input
                type="text"
                placeholder="e.g. NDLS, CSMT"
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none uppercase font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Station Code
              </label>
              <input
                type="text"
                placeholder="e.g. BSB, HWH"
                value={destCode}
                onChange={(e) => setDestCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none uppercase font-mono"
              />
            </div>
          </div>

          {/* Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Train Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-railway-navy focus:outline-none bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c === 'ALL' ? 'All Train Types' : c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operating Day
              </label>
              <select
                value={operatingDay}
                onChange={(e) => setOperatingDay(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-railway-navy focus:outline-none bg-white"
              >
                {days.map((d) => (
                  <option key={d} value={d}>{d === 'ALL' ? 'Any Day of Week' : d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departure Time
              </label>
              <select
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-railway-navy focus:outline-none bg-white"
              >
                {timeRanges.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Button actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
            >
              Reset All Filters
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-railway-navy hover:bg-railway-blue text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Apply & Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
        <span>Found {trains.length} train services</span>
        <span className="text-[11px] text-slate-400">Data Freshness: 30s Cache</span>
      </div>

      {/* Train Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : trains.length === 0 ? (
        <EmptyState
          title="No Trains Found"
          description="We couldn't find any trains matching your search criteria. Try removing filters or searching by train number."
          actionText="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trains.map((train) => (
            <TrainCard key={train.id} train={train} />
          ))}
        </div>
      )}
    </div>
  );
};
