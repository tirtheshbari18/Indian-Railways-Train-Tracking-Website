import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrainCompareResponse, Train } from '../types';
import { CardSkeleton } from '../components/common/LoadingSkeleton';
import {
  GitCompare,
  Plus,
  Trash2,
  Trophy,
  Zap,
  Clock,
  Gauge,
  Star,
  MapPin,
  Check
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const TrainComparisonPage: React.FC = () => {
  const [selectedTrainNumbers, setSelectedTrainNumbers] = useState<string[]>(['22436', '12002']);
  const [comparison, setComparison] = useState<TrainCompareResponse | null>(null);
  const [allTrains, setAllTrains] = useState<Train[]>([]);
  const [newTrainInput, setNewTrainInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const { toast } = useToast();

  useEffect(() => {
    const fetchAllTrains = async () => {
      try {
        const list = await api.trains.search({ limit: 50 });
        setAllTrains(list);
      } catch (err) {
        console.error("Fetch trains list error:", err);
      }
    };
    fetchAllTrains();
  }, []);

  const runComparison = async (numbers: string[]) => {
    if (numbers.length < 2) {
      setComparison(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.trains.compare(numbers);
      setComparison(data);
    } catch (err: any) {
      toast(err.response?.data?.detail || "Could not compare trains", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison(selectedTrainNumbers);
  }, [selectedTrainNumbers]);

  const handleAddTrain = (num: string) => {
    if (selectedTrainNumbers.includes(num)) {
      toast("Train is already in the comparison list", "info");
      return;
    }
    if (selectedTrainNumbers.length >= 4) {
      toast("Maximum 4 trains can be compared simultaneously", "warning");
      return;
    }
    setSelectedTrainNumbers([...selectedTrainNumbers, num]);
    setNewTrainInput('');
  };

  const handleRemoveTrain = (num: string) => {
    if (selectedTrainNumbers.length <= 2) {
      toast("At least 2 trains are required for comparison", "warning");
      return;
    }
    setSelectedTrainNumbers(selectedTrainNumbers.filter(n => n !== num));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-railway-navy" />
          <span>Train Speed, Halt & Punctuality Comparison</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Evaluate multiple express and superfast trains side-by-side to choose the optimal railway service.
        </p>
      </div>

      {/* Control Selector Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Add Train:</span>
          <select
            value={newTrainInput}
            onChange={(e) => {
              if (e.target.value) handleAddTrain(e.target.value);
            }}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-railway-navy focus:outline-none bg-white"
          >
            <option value="">Select train from fleet...</option>
            {allTrains.map((t) => (
              <option key={t.id} value={t.train_number}>
                {t.train_number} - {t.train_name} ({t.train_category})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedTrainNumbers.map((num) => (
            <span
              key={num}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-xs"
            >
              <span>{num}</span>
              {selectedTrainNumbers.length > 2 && (
                <button
                  onClick={() => handleRemoveTrain(num)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Winner Highlights Banner */}
      {comparison && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Fastest Journey</span>
              <div className="font-extrabold text-base text-slate-900 font-mono">
                Train #{comparison.fastest_train_number}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-300/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-railway-navy text-white flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">Least Halts</span>
              <div className="font-extrabold text-base text-slate-900 font-mono">
                Train #{comparison.least_stops_train_number}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-300/60 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Top Reliability</span>
              <div className="font-extrabold text-base text-slate-900 font-mono">
                Train #{comparison.highest_punctuality_train_number}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Columns Matrix */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !comparison ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparison.trains.map((item) => {
            const isFastest = item.train.train_number === comparison.fastest_train_number;
            const isLeastStops = item.train.train_number === comparison.least_stops_train_number;
            const isHighestPunctual = item.train.train_number === comparison.highest_punctuality_train_number;

            return (
              <div
                key={item.train.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Header */}
                <div className="p-5 bg-slate-900 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-railway-accent text-white">
                      {item.train.train_number}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {item.train.train_category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-100">{item.train.train_name}</h3>
                  <div className="text-xs text-slate-400 mt-1">
                    {item.train.source_station.name} ({item.train.source_station.code}) → {item.train.destination_station.name} ({item.train.destination_station.code})
                  </div>
                </div>

                {/* Metrics Table */}
                <div className="p-5 space-y-3.5 divide-y divide-slate-100 text-xs">
                  {/* Journey Duration */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Journey Duration:</span>
                    <span className={`font-mono font-bold ${isFastest ? 'text-amber-600' : 'text-slate-900'}`}>
                      {item.duration_formatted} {isFastest && '⚡ (Fastest)'}
                    </span>
                  </div>

                  {/* Halts */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Designated Halts:</span>
                    <span className={`font-mono font-bold ${isLeastStops ? 'text-blue-600' : 'text-slate-900'}`}>
                      {item.total_stops} Stops {isLeastStops && '★'}
                    </span>
                  </div>

                  {/* Avg Speed */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Average Transit Speed:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.average_speed_kmh} km/h
                    </span>
                  </div>

                  {/* Max Speed */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Maximum Permissible Speed:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.max_speed_kmh} km/h
                    </span>
                  </div>

                  {/* Punctuality */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Reliability Rating:</span>
                    <span className="font-mono font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{item.punctuality_rating.toFixed(1)} / 5.0</span>
                    </span>
                  </div>

                  {/* Distance */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-slate-500 font-medium">Total Distance:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {item.train.total_distance_km} km
                    </span>
                  </div>

                  {/* Classes */}
                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-1">Available Classes:</span>
                    <div className="flex flex-wrap gap-1">
                      {item.classes_available.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] font-bold text-slate-700">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Operating Days */}
                  <div className="pt-2">
                    <span className="text-slate-500 font-medium block mb-1">Operating Days:</span>
                    <span className="font-mono text-slate-700">{item.train.operating_days}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  <a
                    href={`/live-status/${item.train.train_number}`}
                    className="block w-full text-center py-2 px-3 rounded-xl bg-railway-navy hover:bg-railway-blue text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Track Live Status →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
