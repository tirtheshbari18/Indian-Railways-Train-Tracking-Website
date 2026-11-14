import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { NetworkMapData } from '../types';
import { RailwayMap } from '../components/map/RailwayMap';
import { TableSkeleton } from '../components/common/LoadingSkeleton';
import { Map, Layers, Radio, Compass, Search } from 'lucide-react';

export const RailwayMapPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stationParam = searchParams.get('station');

  const [mapData, setMapData] = useState<NetworkMapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchStation, setSearchStation] = useState<string>(stationParam || '');

  useEffect(() => {
    const fetchMap = async () => {
      setLoading(true);
      try {
        const data = await api.map.getNetwork();
        setMapData(data);
      } catch (err) {
        console.error("Map fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMap();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-railway-navy" />
            <span>National Indian Railways Geographic Radar</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time interactive Leaflet mapping of trunk routes, junction stations, and live rolling stock.
          </p>
        </div>

        {/* Quick Station Finder on Map */}
        <div className="flex items-center gap-2 max-w-xs w-full">
          <input
            type="text"
            placeholder="Focus Station Code (e.g. NDLS)..."
            value={searchStation}
            onChange={(e) => setSearchStation(e.target.value)}
            className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-railway-navy focus:outline-none uppercase font-mono"
          />
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={12} />
      ) : !mapData ? (
        <div className="p-8 text-center text-slate-500">Could not load railway map data.</div>
      ) : (
        <div className="space-y-4">
          <RailwayMap
            data={mapData}
            height="680px"
            selectedStationCode={searchStation}
          />

          {/* Quick Station Jump Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <span className="text-xs font-bold text-slate-700 block mb-2">
              Major National Terminals & Hubs:
            </span>
            <div className="flex flex-wrap gap-2">
              {mapData.stations.slice(0, 10).map((st) => (
                <button
                  key={st.id}
                  onClick={() => setSearchStation(st.code)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    searchStation.toUpperCase() === st.code.toUpperCase()
                      ? 'bg-railway-navy text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-mono font-bold mr-1">{st.code}</span>
                  <span>{st.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
