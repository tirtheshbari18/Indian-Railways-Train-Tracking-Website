import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Favourite, SearchHistoryItem } from '../types';
import { useToast } from '../context/ToastContext';
import {
  User,
  Bookmark,
  History,
  Trash2,
  Train,
  MapPin,
  ArrowRight,
  Shield,
  Calendar
} from 'lucide-react';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const UserProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [favs, hist] = await Promise.all([
          api.user.getFavourites(),
          api.user.getHistory()
        ]);
        setFavourites(favs);
        setHistory(hist);
      } catch (err) {
        console.error("Profile data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleRemoveFavourite = async (id: number) => {
    try {
      await api.user.removeFavourite(id);
      setFavourites(favourites.filter(f => f.id !== id));
      toast("Removed from favourites", "info");
    } catch (err) {
      toast("Could not remove favourite", "error");
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.user.clearHistory();
      setHistory([]);
      toast("Search history cleared", "info");
    } catch (err) {
      toast("Could not clear history", "error");
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-railway-navy to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{user.full_name || 'Passenger'}</h1>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-railway-accent text-white rounded-xl text-xs font-bold transition-colors hover:bg-orange-600 shadow-sm flex items-center gap-1.5"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Favourites Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-500" />
              <span>Saved Favourites ({favourites.length})</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick access to your monitored trains and frequent transit stations
            </p>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : favourites.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No favourites saved yet</p>
            <p className="text-xs text-slate-400 mt-0.5 max-w-sm mx-auto">
              Click the bookmark icon on any train card or station to add it to your quick-access favorites.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favourites.map((fav) => (
              <div
                key={fav.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    fav.item_type === 'train' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {fav.item_type === 'train' ? <Train className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{fav.title}</h4>
                    <p className="text-xs text-slate-500">{fav.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={fav.item_type === 'train' ? `/live-status/${fav.train_number}` : `/stations/${fav.station_code}`}
                    className="p-2 rounded-xl bg-railway-navy text-white hover:bg-railway-blue text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleRemoveFavourite(fav.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-railway-blue" />
              <span>Recent Search History</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Your recent train inquiries and timetable searches
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent searches recorded.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {history.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{h.search_query}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({h.query_type})</span>
                </div>
                <span className="text-slate-400 text-[11px] font-mono">
                  {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
