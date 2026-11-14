import React from 'react';
import { Link } from 'react-router-dom';
import { Train } from '../../types';
import { Clock, ArrowRight, ShieldCheck, Star, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface Props {
  train: Train;
}

export const TrainCard: React.FC<Props> = ({ train }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast("Please sign in to save favourites", "info");
      return;
    }
    try {
      await api.user.addFavourite({ item_type: 'train', train_id: train.id });
      toast(`Saved ${train.train_name} to your favourites!`, "success");
    } catch (err) {
      toast("Could not save to favourites", "error");
    }
  };

  const hours = Math.floor(train.total_duration_minutes / 60);
  const mins = train.total_duration_minutes % 60;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-railway-dark text-white rounded-lg shadow-sm">
              {train.train_number}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-railway-blue border border-blue-100">
              {train.train_category}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleBookmark}
              title="Save to Favourites"
              className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{train.punctuality_rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Train Name */}
        <h3 className="font-bold text-slate-900 text-base group-hover:text-railway-navy transition-colors mb-4">
          {train.train_name}
        </h3>

        {/* Route Times Grid */}
        <div className="grid grid-cols-3 items-center py-3 px-4 bg-slate-50 rounded-xl mb-4 text-center border border-slate-100">
          <div>
            <div className="text-lg font-extrabold text-slate-900 font-mono">
              {train.departure_time}
            </div>
            <div className="text-xs font-bold text-slate-700">
              {train.source_station.code}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[80px] mx-auto">
              {train.source_station.name}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{hours}h {mins}m</span>
            </span>
            <div className="w-full flex items-center justify-center my-1">
              <div className="h-0.5 w-12 bg-slate-300 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-500"></div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {train.total_distance_km} km
            </span>
          </div>

          <div>
            <div className="text-lg font-extrabold text-slate-900 font-mono">
              {train.arrival_time}
            </div>
            <div className="text-xs font-bold text-slate-700">
              {train.destination_station.code}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-[80px] mx-auto">
              {train.destination_station.name}
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mb-4 gap-2">
          <div>
            <span className="font-semibold text-slate-700">Runs On: </span>
            <span className="font-mono text-slate-600">{train.operating_days}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Classes: </span>
            <span className="font-mono text-slate-600">{train.classes}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <Link
          to={`/live-status/${train.train_number}`}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-railway-navy hover:bg-railway-blue text-white text-xs font-bold transition-colors shadow-sm"
        >
          <span>Live Status</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to={`/train-route?train=${train.train_number}`}
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
        >
          <span>View Route</span>
        </Link>
      </div>
    </div>
  );
};
