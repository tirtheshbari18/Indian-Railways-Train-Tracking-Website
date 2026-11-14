import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Station } from '../types';
import { StationCard } from '../components/station/StationCard';
import { SearchBarAutocomplete } from '../components/common/SearchBarAutocomplete';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { MapPin, Filter, Search, Building } from 'lucide-react';

export const StationSearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState('ALL');
  const [state, setState] = useState('ALL');
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  const zones = ["ALL", "NR", "WR", "CR", "SR", "ER", "NCR", "WCR", "SWR", "SCR", "ECR", "NWR"];
  const states = [
    "ALL", "Delhi", "Maharashtra", "Gujarat", "Uttar Pradesh",
    "Madhya Pradesh", "West Bengal", "Tamil Nadu", "Karnataka", "Telangana", "Rajasthan", "Bihar"
  ];

  const fetchStations = async () => {
    setLoading(true);
    try {
      const data = await api.stations.search({
        query: query || undefined,
        zone: zone !== 'ALL' ? zone : undefined,
        state: state !== 'ALL' ? state : undefined,
      });
      setStations(data);
    } catch (err) {
      console.error("Stations error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, [zone, state]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStations();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-railway-navy" />
          <span>Indian Railways Stations Directory</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore railway junction codes, platform infrastructures, divisions, and operating zones across India.
        </p>
      </div>

      {/* Autocomplete Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <SearchBarAutocomplete
          placeholder="Type station name or code with autocomplete (e.g. NDLS, Mumbai, Kanpur)..."
          defaultMode="station"
        />

        {/* Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Railway Zone
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-railway-navy focus:outline-none bg-white"
            >
              {zones.map((z) => (
                <option key={z} value={z}>{z === 'ALL' ? 'All Railway Zones' : `${z} Zone`}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              State / Union Territory
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-railway-navy focus:outline-none bg-white"
            >
              {states.map((s) => (
                <option key={s} value={s}>{s === 'ALL' ? 'All States' : s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
        <span>Found {stations.length} railway stations</span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : stations.length === 0 ? (
        <EmptyState
          title="No Stations Found"
          description="We couldn't find any stations matching the selected criteria. Try changing filters."
          actionText="Reset Filters"
          onAction={() => {
            setQuery('');
            setZone('ALL');
            setState('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((st) => (
            <StationCard key={st.id} station={st} />
          ))}
        </div>
      )}
    </div>
  );
};
