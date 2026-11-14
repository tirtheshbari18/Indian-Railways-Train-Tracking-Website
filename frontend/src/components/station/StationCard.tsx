import React from 'react';
import { Link } from 'react-router-dom';
import { Station } from '../../types';
import { MapPin, ArrowRight, Train, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

interface Props {
  station: Station;
}

export const StationCard: React.FC<Props> = ({ station }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast("Please sign in to save favourites", "info");
      return;
    }
    try {
      await api.user.addFavourite({ item_type: 'station', station_id: station.id });
      toast(`Saved ${station.name} to favourites`, "success");
    } catch (err) {
      toast("Could not save to favourites", "error");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="font-mono text-xs font-bold px-2.5 py-1 bg-amber-600 text-white rounded-lg shadow-sm">
            {station.code}
          </span>
          <div className="flex items-center gap-2">
            {station.zone && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {station.zone} Zone
              </span>
            )}
            <button
              onClick={handleBookmark}
              title="Bookmark station"
              className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-800 transition-colors">
          {station.name}
        </h3>
        {station.hindi_name && (
          <div className="text-xs text-slate-400 font-sans mt-0.5">
            {station.hindi_name}
          </div>
        )}

        <div className="text-xs text-slate-500 mt-3 space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{station.state} {station.division ? `• ${station.division} Division` : ''}</span>
          </div>
          <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-600">
            <span>Platforms: <b>{station.number_of_platforms}</b></span>
            <span>•</span>
            <span>Category: <b>{station.station_category || 'A1'}</b></span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          to={`/stations/${station.code}`}
          className="text-xs font-bold text-railway-navy hover:text-railway-blue flex items-center gap-1 group-hover:underline"
        >
          <span>Live Board & Platforms</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <Link
          to={`/railway-map?station=${station.code}`}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium"
        >
          View on Map
        </Link>
      </div>
    </div>
  );
};
