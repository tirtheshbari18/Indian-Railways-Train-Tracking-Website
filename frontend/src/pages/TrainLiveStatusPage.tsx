import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LiveStatus, TrainRouteDetail } from '../types';
import { RunningTracker } from '../components/train/RunningTracker';
import { TrainRouteMap } from '../components/map/TrainRouteMap';
import { DelayChart } from '../components/train/DelayChart';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { Radio, Search, CheckCircle2, Clock, MapPin, Compass } from 'lucide-react';

export const TrainLiveStatusPage: React.FC = () => {
  const { trainNumber: paramTrainNumber } = useParams<{ trainNumber?: string }>();
  const [trainNumber, setTrainNumber] = useState<string>(paramTrainNumber || '22436');
  const [inputNumber, setInputNumber] = useState<string>(trainNumber);

  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [routeDetail, setRouteDetail] = useState<TrainRouteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const popularTrains = [
    { num: '22436', name: 'Vande Bharat (NDLS-BSB)' },
    { num: '12002', name: 'Bhopal Shatabdi' },
    { num: '12951', name: 'Tejas Rajdhani (MMCT-NDLS)' },
    { num: '12301', name: 'Howrah Rajdhani' },
    { num: '20901', name: 'Gandhinagar Vande Bharat' },
    { num: '12626', name: 'Kerala Express' },
  ];

  const fetchLiveStatus = async (targetNum: string) => {
    setLoading(true);
    try {
      const [statusData, routeData] = await Promise.all([
        api.trains.getLiveStatus(targetNum),
        api.trains.getRoute(targetNum)
      ]);
      setLiveStatus(statusData);
      setRouteDetail(routeData);
    } catch (err: any) {
      toast(err.response?.data?.detail || `Train ${targetNum} not found`, 'error');
      setLiveStatus(null);
      setRouteDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const num = paramTrainNumber || '22436';
    setTrainNumber(num);
    setInputNumber(num);
    fetchLiveStatus(num);
  }, [paramTrainNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNumber.trim()) return;
    navigate(`/live-status/${inputNumber.trim()}`);
  };

  const handleSimulateTick = async () => {
    setSimulating(true);
    try {
      await api.trains.simulateTick();
      await fetchLiveStatus(trainNumber);
      toast("GPS Telemetry position updated along the route", "success");
    } catch (err) {
      toast("Simulation failed", "error");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Search & Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <Radio className="w-6 h-6 text-emerald-500 animate-pulse" />
              <span>Live Train Running Status & Telematics</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Verify live GPS positions, speed, delay status and arrival forecasts.
            </p>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder="Enter 5-digit train number (e.g. 22436)"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-xl text-xs font-bold transition-colors shadow-sm shrink-0"
            >
              Track
            </button>
          </form>
        </div>

        {/* Popular Quick-Select Train Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500">Popular:</span>
          {popularTrains.map((pt) => (
            <button
              key={pt.num}
              onClick={() => navigate(`/live-status/${pt.num}`)}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors ${
                trainNumber === pt.num
                  ? 'bg-railway-navy text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {pt.num} - {pt.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : !liveStatus ? (
        <EmptyState
          title="Train Status Not Available"
          description={`We could not load live running data for train #${trainNumber}. Please check the train number.`}
          actionText="Track Vande Bharat (22436)"
          onAction={() => navigate('/live-status/22436')}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Running Status Card */}
          <RunningTracker
            status={liveStatus}
            onSimulateTick={handleSimulateTick}
            isSimulating={simulating}
          />

          {/* Route Map with GPS Position */}
          {routeDetail && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Compass className="w-4 h-4 text-railway-blue" />
                  <span>Geographic Route & Live Telemetry Marker</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  GPS: {liveStatus.current_latitude?.toFixed(4)}, {liveStatus.current_longitude?.toFixed(4)}
                </span>
              </div>
              <TrainRouteMap
                coordinates={routeDetail.coordinates}
                stops={routeDetail.stops}
                currentLocation={{
                  latitude: liveStatus.current_latitude || 25.85,
                  longitude: liveStatus.current_longitude || 81.15,
                  speed_kmh: liveStatus.current_speed_kmh,
                  train_number: liveStatus.train_number
                }}
                height="450px"
              />
            </div>
          )}

          {/* Station Delay Chart */}
          <DelayChart stops={liveStatus.stops_timeline} />

          {/* Stop Timeline Live Progress Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Station-by-Station Live Progress Timeline</h3>
              <span className="text-xs text-slate-400 font-mono">
                {liveStatus.stops_timeline.length} Scheduled Halts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3 px-4">Stop #</th>
                    <th className="py-3 px-4">Station</th>
                    <th className="py-3 px-4">Distance</th>
                    <th className="py-3 px-4">Scheduled Arr / Dep</th>
                    <th className="py-3 px-4">Actual / Expected</th>
                    <th className="py-3 px-4">Delay</th>
                    <th className="py-3 px-4">Platform</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {liveStatus.stops_timeline.map((stop) => {
                    const isPassed = stop.status === 'DEPARTED';
                    const isCurrent = stop.status === 'CURRENT';

                    return (
                      <tr
                        key={stop.stop_sequence}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-amber-50/70 font-semibold'
                            : isPassed
                            ? 'bg-slate-50/40 text-slate-500'
                            : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                          #{stop.stop_sequence}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{stop.station_name}</div>
                          <div className="font-mono text-xs text-railway-accent">{stop.station_code}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-mono">
                          {stop.distance_km} km
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          <div>Arr: {stop.scheduled_arrival || '--'}</div>
                          <div>Dep: {stop.scheduled_departure || '--'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          <div>Arr: {stop.actual_arrival || '--'}</div>
                          <div>Dep: {stop.actual_departure || '--'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {stop.delay_minutes > 0 ? (
                            <span className="text-rose-600 font-bold">+{stop.delay_minutes}m</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">Right Time</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {stop.platform_number ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">
                              PF {stop.platform_number}
                            </span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isPassed ? (
                            <span className="inline-flex items-center gap-1 text-slate-500 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>Departed</span>
                            </span>
                          ) : isCurrent ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full text-[11px] animate-pulse">
                              <span>At Station</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-blue-500" />
                              <span>Upcoming</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
