import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchBarAutocomplete } from '../components/common/SearchBarAutocomplete';
import { TrainCard } from '../components/train/TrainCard';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import { LiveStatusBadge } from '../components/common/LiveStatusBadge';
import { api } from '../services/api';
import { Train, LiveStatus } from '../types';
import {
  Train as TrainIcon,
  Radio,
  MapPin,
  GitCompare,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CalendarClock
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredTrains, setFeaturedTrains] = useState<Train[]>([]);
  const [liveTrackerSample, setLiveTrackerSample] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Search input state for source -> destination fast search
  const [sourceCode, setSourceCode] = useState('');
  const [destCode, setDestCode] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trains = await api.trains.featured();
        setFeaturedTrains(trains);

        // Fetch sample live status for 22436 Vande Bharat
        const live = await api.trains.getLiveStatus('22436');
        setLiveTrackerSample(live);
      } catch (err) {
        console.error("Home page load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRouteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode && !destCode) return;
    navigate(`/train-search?source_code=${encodeURIComponent(sourceCode)}&destination_code=${encodeURIComponent(destCode)}`);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-railway-dark via-slate-900 to-railway-navy text-white p-6 sm:p-10 lg:p-14 shadow-xl border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-4">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Official Grade Indian Railways Tracking Network</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Live Train Telemetry, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Precise Routes & Station Timetables
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-2xl leading-relaxed">
            Track Indian Railways trains in real time with GPS telemetry, verify intermediate halts, inspect platform facilities, and compare express journey times across all railway zones.
          </p>

          {/* Quick Autocomplete Search */}
          <div className="max-w-2xl mb-8">
            <SearchBarAutocomplete
              placeholder="Search train by 5-digit number, name, or station (e.g. 22436, Vande Bharat, NDLS)..."
            />
          </div>

          {/* Quick Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
            <div>
              <div className="font-bold text-white text-lg font-mono">100%</div>
              <div className="text-slate-400 text-[11px]">Trunk Line Coverage</div>
            </div>
            <div>
              <div className="font-bold text-white text-lg font-mono">&lt; 15s</div>
              <div className="text-slate-400 text-[11px]">Telemetry Sync</div>
            </div>
            <div>
              <div className="font-bold text-white text-lg font-mono">18 Zones</div>
              <div className="text-slate-400 text-[11px]">Indian Railway Divisions</div>
            </div>
            <div>
              <div className="font-bold text-emerald-400 text-lg font-mono">Verified</div>
              <div className="text-slate-400 text-[11px]">Platform Level Data</div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Station Route Search Bar */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrainIcon className="w-5 h-5 text-railway-navy" />
          <h2 className="text-base font-bold text-slate-900">Find Trains Between Stations</h2>
        </div>
        <form onSubmit={handleRouteSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Source Station (Code or City)
            </label>
            <input
              type="text"
              placeholder="e.g. NDLS (New Delhi)"
              value={sourceCode}
              onChange={(e) => setSourceCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none uppercase font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Destination Station (Code or City)
            </label>
            <input
              type="text"
              placeholder="e.g. BSB (Varanasi)"
              value={destCode}
              onChange={(e) => setDestCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-railway-navy focus:outline-none uppercase font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-railway-navy hover:bg-railway-blue text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Search Direct Trains</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* Live Running Spotlight Banner */}
      {liveTrackerSample && (
        <section className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-blue-800">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-blue-800/80 rounded-xl text-amber-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">Live Tracking Spotlight</h3>
                  <LiveStatusBadge
                    dataSourceType={liveTrackerSample.data_source_type}
                    isLiveVerified={liveTrackerSample.is_live_verified}
                    size="sm"
                  />
                </div>
                <div className="text-xs text-blue-200">
                  {liveTrackerSample.train_number} - {liveTrackerSample.train_name}
                </div>
              </div>
            </div>

            <Link
              to={`/live-status/${liveTrackerSample.train_number}`}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Open Full Live Radar →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-black/20 p-4 rounded-xl text-xs font-mono">
            <div>
              <span className="text-blue-300 text-[11px] block">Current Speed</span>
              <span className="text-lg font-bold text-white">{liveTrackerSample.current_speed_kmh} km/h</span>
            </div>
            <div>
              <span className="text-blue-300 text-[11px] block">Delay Status</span>
              <span className={`text-lg font-bold ${liveTrackerSample.delay_minutes > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {liveTrackerSample.delay_minutes === 0 ? 'On Time' : `+${liveTrackerSample.delay_minutes} min`}
              </span>
            </div>
            <div>
              <span className="text-blue-300 text-[11px] block">Last Station</span>
              <span className="text-base font-bold text-white">
                {liveTrackerSample.last_reported_station?.code || 'NDLS'}
              </span>
            </div>
            <div>
              <span className="text-blue-300 text-[11px] block">Next Stop</span>
              <span className="text-base font-bold text-white">
                {liveTrackerSample.next_scheduled_station?.code || 'PRYJ'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Trains Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Featured Express & High-Speed Trains</h2>
            <p className="text-xs text-slate-500">
              Top-rated Vande Bharat, Tejas Rajdhani, Shatabdi and Duronto services
            </p>
          </div>
          <Link
            to="/train-search"
            className="text-xs font-bold text-railway-navy hover:text-railway-blue flex items-center gap-1"
          >
            <span>View All Trains</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTrains.map((train) => (
              <TrainCard key={train.id} train={train} />
            ))}
          </div>
        )}
      </section>

      {/* Key Services 4-Card Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/live-status"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-railway-blue">
            Live Train Tracker
          </h3>
          <p className="text-xs text-slate-500">
            Real-time GPS coordinates, delay minutes, and journey completion meters.
          </p>
        </Link>

        <Link
          to="/train-route"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-railway-blue">
            Route Visualiser
          </h3>
          <p className="text-xs text-slate-500">
            Interactive geographic timeline map and distance between railway stations.
          </p>
        </Link>

        <Link
          to="/comparison"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <GitCompare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-railway-blue">
            Train Comparison
          </h3>
          <p className="text-xs text-slate-500">
            Compare duration, halts, speeds, and punctuality ratings side by side.
          </p>
        </Link>

        <Link
          to="/railway-map"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-railway-blue">
            National Rail Map
          </h3>
          <p className="text-xs text-slate-500">
            Geographic Leaflet network map of all Indian Railway zones and junctions.
          </p>
        </Link>
      </section>
    </div>
  );
};
