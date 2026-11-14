import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { LiveStatus, TrainRouteDetail } from '../types';
import { RunningTracker } from '../components/train/RunningTracker';
import { TrainRouteMap } from '../components/map/TrainRouteMap';
import { DelayChart } from '../components/train/DelayChart';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { Radio, Search, CheckCircle2, Clock, Compass, Activity, Zap, Play, Pause, FastForward } from 'lucide-react';

export const TrainLiveStatusPage: React.FC = () => {
  const { trainNumber: paramTrainNumber } = useParams<{ trainNumber?: string }>();
  const [trainNumber, setTrainNumber] = useState<string>(paramTrainNumber || '12951');
  const [inputNumber, setInputNumber] = useState<string>(trainNumber);

  const [liveStatus, setLiveStatus] = useState<LiveStatus | null>(null);
  const [routeDetail, setRouteDetail] = useState<TrainRouteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [isAutoTracking, setIsAutoTracking] = useState<boolean>(true);

  // Dynamic progress reference for live GPS simulation
  const progressRatioRef = useRef<number>(0.52);
  const lastTickTimeRef = useRef<number>(Date.now());

  const { toast } = useToast();
  const navigate = useNavigate();

  const popularTrains = [
    { num: '22961', name: '22961 - Vande Bharat (MMCT-ADI)' },
    { num: '22962', name: '22962 - Vande Bharat (ADI-MMCT)' },
    { num: '15557', name: '15557 - Amrit Bharat (DBG-ANVT)' },
    { num: '22401', name: '22401 - VB Sleeper (NDLS-MMCT)' },
    { num: '12951', name: '12951 - Tejas Rajdhani (MMCT-NDLS)' },
    { num: '22436', name: '22436 - Vande Bharat (NDLS-BSB)' },
    { num: '12002', name: '12002 - Bhopal Shatabdi' },
    { num: '69101', name: '69101 - MEMU (BRC-ADI)' },
    { num: '90001', name: '90001 - AC EMU Local (CCG-VR)' },
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

      // Initialize progress ratio from status
      if (statusData && statusData.progress_percentage) {
        progressRatioRef.current = statusData.progress_percentage / 100;
      } else {
        progressRatioRef.current = 0.52;
      }
    } catch (err: any) {
      toast(err.response?.data?.detail || `Train ${targetNum} not found`, 'error');
      setLiveStatus(null);
      setRouteDetail(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const num = paramTrainNumber || '12951';
    setTrainNumber(num);
    setInputNumber(num);
    fetchLiveStatus(num);
  }, [paramTrainNumber]);

  // Real-time GPS movement simulation loop (every 3 seconds)
  useEffect(() => {
    if (!isAutoTracking || !routeDetail || !routeDetail.coordinates || routeDetail.coordinates.length < 2) {
      return;
    }

    const interval = setInterval(() => {
      // Step forward by 0.25% of route
      let newRatio = progressRatioRef.current + 0.0025;
      if (newRatio >= 0.99) newRatio = 0.05; // Loop back towards start when reached
      progressRatioRef.current = newRatio;

      const coords = routeDetail.coordinates;
      const exactIndex = newRatio * (coords.length - 1);
      const lowIdx = Math.floor(exactIndex);
      const highIdx = Math.min(lowIdx + 1, coords.length - 1);
      const fract = exactIndex - lowIdx;

      // Linear interpolation between waypoints
      const lat = coords[lowIdx][0] + (coords[highIdx][0] - coords[lowIdx][0]) * fract;
      const lng = coords[lowIdx][1] + (coords[highIdx][1] - coords[lowIdx][1]) * fract;

      // Realistic speed fluctuation (±1.5 km/h)
      const baseSpeed = liveStatus?.current_speed_kmh || 128.0;
      const speedJitter = Math.sin(Date.now() / 2500) * 1.8;
      const speed = Math.round((Math.max(60, baseSpeed + speedJitter)) * 10) / 10;

      // Distance covered & remaining
      const totalDist = routeDetail.total_distance_km;
      const covered = Math.round(totalDist * newRatio * 10) / 10;
      const remaining = Math.round((totalDist - covered) * 10) / 10;
      const progPct = Math.round(newRatio * 100);

      // Update stop timelines statuses
      setLiveStatus(prev => {
        if (!prev) return prev;

        const updatedTimeline = prev.stops_timeline.map(s => {
          if (s.distance_km <= covered - 10) {
            return { ...s, status: 'DEPARTED' as const };
          } else if (Math.abs(s.distance_km - covered) <= 25) {
            return { ...s, status: 'CURRENT' as const };
          } else {
            return { ...s, status: 'UPCOMING' as const };
          }
        });

        return {
          ...prev,
          current_latitude: lat,
          current_longitude: lng,
          current_speed_kmh: speed,
          distance_covered_km: covered,
          distance_remaining_km: remaining,
          progress_percentage: progPct,
          stops_timeline: updatedTimeline,
          last_updated: new Date().toISOString()
        };
      });

    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoTracking, routeDetail]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNumber.trim()) return;
    const clean = inputNumber.trim();
    setTrainNumber(clean);
    navigate(`/live-status/${clean}`);
    fetchLiveStatus(clean);
  };

  const handleManualAdvance = () => {
    if (!routeDetail || !routeDetail.coordinates) return;
    progressRatioRef.current = Math.min(0.98, progressRatioRef.current + 0.05);
    toast("Simulated train forward advance by 5%", "info");
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
              Real-time satellite GPS tracking along authentic Indian Railways corridors with dynamic speed telemetry.
            </p>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <input
              type="text"
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              placeholder="Enter Train Number (e.g. 12951)"
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
          <span className="font-semibold text-slate-500">Popular Trains:</span>
          {popularTrains.map((pt) => (
            <button
              key={pt.num}
              onClick={() => navigate(`/live-status/${pt.num}`)}
              className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-colors ${
                trainNumber === pt.num
                  ? 'bg-railway-navy text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {pt.name}
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
          actionText="Track Mumbai Rajdhani (12951)"
          onAction={() => navigate('/live-status/12951')}
        />
      ) : (
        <div className="space-y-6">
          {/* Active Live Telematics Control Strip */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${isAutoTracking ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                <span className="font-bold tracking-wide uppercase">
                  {isAutoTracking ? '🔴 Live GPS Streaming: ACTIVE' : '⏸️ Telemetry Stream: PAUSED'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span>OHE Traction: <b>25.2 kV AC</b></span>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-slate-300">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Signal Aspect: <b className="text-emerald-400">Green (Clear)</b></span>
              </div>
              <div className="text-slate-400 font-mono">
                Speed: <b className="text-white">{liveStatus.current_speed_kmh} km/h</b>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoTracking(!isAutoTracking)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isAutoTracking
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                }`}
              >
                {isAutoTracking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoTracking ? 'Pause Stream' : 'Resume Live Stream'}</span>
              </button>
              <button
                onClick={handleManualAdvance}
                title="Advance simulation forward along the track"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>+5%</span>
              </button>
            </div>
          </div>

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
                  <span>Geographic Corridor & Real-Time Telemetry Marker</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  GPS: {liveStatus.current_latitude?.toFixed(4)}, {liveStatus.current_longitude?.toFixed(4)}
                </span>
              </div>
              <TrainRouteMap
                key={`live-map-${trainNumber}-${routeDetail.train_number}-${routeDetail.total_stops}`}
                trainNumber={trainNumber}
                coordinates={routeDetail.coordinates}
                stops={routeDetail.stops}
                currentLocation={{
                  latitude: liveStatus.current_latitude || routeDetail.coordinates[0][0],
                  longitude: liveStatus.current_longitude || routeDetail.coordinates[0][1],
                  speed_kmh: liveStatus.current_speed_kmh,
                  train_number: liveStatus.train_number
                }}
                height="480px"
              />
            </div>
          )}

          {/* Station Delay Chart */}
          <DelayChart stops={liveStatus.stops_timeline} />

          {/* Stop Timeline Live Progress Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Station-by-Station Live Progress Timeline</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Real-time status updates as train traverses block sections</p>
              </div>
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
                            ? 'bg-amber-50/80 font-semibold'
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
                              {stop.platform_number}
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
                            <span className="inline-flex items-center gap-1 text-amber-800 font-bold bg-amber-100 px-2.5 py-1 rounded-full text-[11px] animate-pulse">
                              <span>Passing Section</span>
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
