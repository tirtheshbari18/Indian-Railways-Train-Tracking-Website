import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Station, StationTimetableEntry } from '../types';
import { LiveStationBoard } from '../components/station/LiveStationBoard';
import { PlatformList } from '../components/station/PlatformList';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import {
  Building2,
  MapPin,
  Train,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const StationDetailsPage: React.FC = () => {
  const { code = 'NDLS' } = useParams<{ code?: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [timetable, setTimetable] = useState<StationTimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchStationData = async () => {
      setLoading(true);
      try {
        const [stData, ttData] = await Promise.all([
          api.stations.getDetails(code),
          api.stations.getTimetable(code),
        ]);
        setStation(stData);
        setTimetable(ttData);
      } catch (err) {
        console.error("Error loading station details:", err);
        setStation(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStationData();
  }, [code]);

  const handleBookmark = async () => {
    if (!user) {
      toast("Please sign in to save favourites", "info");
      return;
    }
    if (!station) return;
    try {
      await api.user.addFavourite({ item_type: 'station', station_id: station.id });
      toast(`Saved ${station.name} to favourites!`, "success");
    } catch (err) {
      toast("Could not save to favourites", "error");
    }
  };

  if (loading) {
    return <TableSkeleton rows={8} />;
  }

  if (!station) {
    return (
      <EmptyState
        title="Station Not Found"
        description={`We could not locate station code '${code}'.`}
        actionText="Back to Station Directory"
        onAction={() => window.history.back()}
      />
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Top Station Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-railway-dark to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-base font-extrabold px-3 py-1 bg-amber-600 text-white rounded-xl shadow-sm">
                {station.code}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {station.zone || 'IR'} Zone
              </span>
              {station.station_category && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-900/60 text-blue-300 border border-blue-800">
                  {station.station_category}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">
              {station.name}
            </h1>
            {station.hindi_name && (
              <div className="text-sm text-slate-400 font-sans mb-3">
                {station.hindi_name}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{station.state} {station.division ? `(${station.division} Division)` : ''}</span>
              </span>
              <span>•</span>
              <span className="font-mono">
                Lat: {station.latitude.toFixed(4)}, Lon: {station.longitude.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleBookmark}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors border border-slate-700"
            >
              <Bookmark className="w-4 h-4 text-amber-400" />
              <span>Save Station</span>
            </button>
            <Link
              to={`/railway-map?station=${station.code}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Locate on Map</span>
            </Link>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-800 text-xs font-mono">
          <div>
            <span className="text-slate-400 text-[11px] block font-sans">Platforms Verified</span>
            <span className="text-lg font-bold text-white">{station.number_of_platforms} Platforms</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-sans">Stopping Trains Scheduled</span>
            <span className="text-lg font-bold text-amber-400">{timetable.length} Active Services</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-sans">Accessibility Status</span>
            <span className="text-lg font-bold text-emerald-400">Divyangjan Compliant</span>
          </div>
        </div>
      </div>

      {/* Verified Platform Facilities */}
      {station.platforms && (
        <PlatformList platforms={station.platforms} stationName={station.name} />
      )}

      {/* Station Arrivals & Departures Live Board */}
      <LiveStationBoard timetable={timetable} stationCode={station.code} />
    </div>
  );
};
