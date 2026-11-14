import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { TrainRouteDetail } from '../types';
import { RouteTimeline } from '../components/train/RouteTimeline';
import { TrainRouteMap } from '../components/map/TrainRouteMap';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Route, Search, Compass, MapPin } from 'lucide-react';

export const TrainRoutePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const trainParam = searchParams.get('train') || '12951';
  const [trainNumber, setTrainNumber] = useState<string>(trainParam);
  const [inputVal, setInputVal] = useState<string>(trainParam);
  const [routeDetail, setRouteDetail] = useState<TrainRouteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const popularRoutes = [
    { num: '22961', name: '22961 - VB (Mumbai-Ahmedabad)' },
    { num: '22962', name: '22962 - VB (Ahmedabad-Mumbai)' },
    { num: '22401', name: '22401 - VB Sleeper (Delhi-Mumbai)' },
    { num: '15557', name: '15557 - Amrit Bharat Express' },
    { num: '22436', name: '22436 - Vande Bharat (NDLS-BSB)' },
    { num: '12951', name: '12951 - Rajdhani (MMCT-NDLS)' },
    { num: '12002', name: '12002 - Shatabdi (NDLS-BPL)' },
    { num: '69101', name: '69101 - MEMU Express' },
    { num: '90001', name: '90001 - Western EMU Local' },
  ];

  const fetchRoute = async (num: string) => {
    setLoading(true);
    try {
      const data = await api.trains.getRoute(num);
      setRouteDetail(data);
    } catch (err) {
      console.error("Route error:", err);
      setRouteDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoute(trainNumber);
  }, [trainNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;
    setTrainNumber(clean);
    setSearchParams({ train: clean });
    fetchRoute(clean);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Search Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Route className="w-6 h-6 text-railway-navy" />
              <span>Train Route & Geometric Alignment</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Complete geographic stops timeline, platform assignments, and distances between junctions.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter Train Number (e.g. 12951)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
            >
              View Route
            </button>
          </form>
        </div>

        {/* Quick select route buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Popular Routes:</span>
          {popularRoutes.map((r) => (
            <button
              key={r.num}
              onClick={() => {
                setTrainNumber(r.num);
                setInputVal(r.num);
                setSearchParams({ train: r.num });
                fetchRoute(r.num);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                trainNumber === r.num
                  ? 'bg-railway-navy text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : !routeDetail ? (
        <EmptyState
          title="Route Not Found"
          description={`We could not locate the geometric stops route for train #${trainNumber}.`}
          actionText="View Vande Bharat Route"
          onAction={() => {
            setTrainNumber('22436');
            setInputVal('22436');
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-bold text-xs bg-railway-accent px-2 py-0.5 rounded">
                  {routeDetail.train_number}
                </span>
                <span className="text-base font-bold">{routeDetail.train_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {routeDetail.category}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                {routeDetail.source.name} ({routeDetail.source.code}) → {routeDetail.destination.name} ({routeDetail.destination.code})
              </div>
            </div>

            <div className="flex items-center gap-6 font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Total Distance</span>
                <span className="font-bold text-base text-amber-400">{routeDetail.total_distance_km} km</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">Intermediate Halts</span>
                <span className="font-bold text-base text-white">{routeDetail.total_stops} Stops</span>
              </div>
            </div>
          </div>

          {/* Interactive Route Map */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-railway-blue" />
              <span>Interactive Leaflet Route Alignment</span>
            </h3>
            <TrainRouteMap
              key={`route-map-${trainNumber}-${routeDetail.train_number}-${routeDetail.total_stops}`}
              coordinates={routeDetail.coordinates}
              stops={routeDetail.stops}
              trainNumber={routeDetail.train_number || trainNumber}
              height="460px"
            />
          </div>

          {/* Detailed Stops Timeline */}
          <RouteTimeline stops={routeDetail.stops} />
        </div>
      )}
    </div>
  );
};
