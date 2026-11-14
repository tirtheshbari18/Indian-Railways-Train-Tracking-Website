import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Train as TrainIcon, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { StationAutocomplete, Train } from '../../types';

interface Props {
  placeholder?: string;
  className?: string;
  onSelectStation?: (station: StationAutocomplete) => void;
  onSelectTrain?: (train: Train) => void;
  defaultMode?: 'all' | 'station' | 'train';
}

export const SearchBarAutocomplete: React.FC<Props> = ({
  placeholder = "Search train by number/name (e.g. 22436, Vande Bharat) or station (NDLS, Mumbai)...",
  className = "",
  onSelectStation,
  onSelectTrain,
  defaultMode = 'all',
}) => {
  const [query, setQuery] = useState("");
  const [stationSuggestions, setStationSuggestions] = useState<StationAutocomplete[]>([]);
  const [trainSuggestions, setTrainSuggestions] = useState<Train[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setStationSuggestions([]);
      setTrainSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        if (defaultMode === 'all' || defaultMode === 'station') {
          const stations = await api.stations.autocomplete(query);
          setStationSuggestions(stations.slice(0, 5));
        }
        if (defaultMode === 'all' || defaultMode === 'train') {
          const trains = await api.trains.search({ query, limit: 5 });
          setTrainSuggestions(trains.slice(0, 5));
        }
        setIsOpen(true);
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, defaultMode]);

  const handleStationClick = (station: StationAutocomplete) => {
    setIsOpen(false);
    setQuery(`${station.code} - ${station.name}`);
    if (onSelectStation) {
      onSelectStation(station);
    } else {
      navigate(`/stations/${station.code}`);
    }
  };

  const handleTrainClick = (train: Train) => {
    setIsOpen(false);
    setQuery(`${train.train_number} - ${train.train_name}`);
    if (onSelectTrain) {
      onSelectTrain(train);
    } else {
      navigate(`/trains/${train.train_number}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    // If it's a 5 digit number or matches train
    if (/^\d{5}$/.test(query.trim())) {
      navigate(`/live-status/${query.trim()}`);
    } else {
      navigate(`/train-search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 text-slate-400 pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-railway-blue" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-3.5 bg-white text-slate-900 placeholder-slate-400 text-sm md:text-base rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-railway-navy focus:border-transparent shadow-sm transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 px-4 py-2 bg-railway-navy hover:bg-railway-blue text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 shadow"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && (stationSuggestions.length > 0 || trainSuggestions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50 divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {trainSuggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrainIcon className="w-3.5 h-3.5 text-railway-navy" />
                <span>Trains</span>
              </div>
              {trainSuggestions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTrainClick(t)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-blue-50/60 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-railway-navy text-white px-2 py-0.5 rounded">
                      {t.train_number}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-railway-blue">
                        {t.train_name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.source_station.name} ({t.source_station.code}) → {t.destination_station.name} ({t.destination_station.code})
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {t.train_category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {stationSuggestions.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-railway-accent" />
                <span>Stations</span>
              </div>
              {stationSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStationClick(s)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-amber-50/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
                      {s.code}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-800">
                        {s.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {s.state} {s.zone ? `• ${s.zone} Zone` : ''}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
