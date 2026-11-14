import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { NetworkMapData } from '../../types';
import { Layers, Filter, Compass, Train as TrainIcon, Navigation } from 'lucide-react';

interface Props {
  data: NetworkMapData;
  height?: string;
  selectedStationCode?: string;
}

export const RailwayMap: React.FC<Props> = ({
  data,
  height = "650px",
  selectedStationCode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [code: string]: L.Marker }>({});

  const [selectedZone, setSelectedZone] = useState<string>("ALL");
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showLiveTrains, setShowLiveTrains] = useState<boolean>(true);

  const zones = ["ALL", "NR", "WR", "CR", "SR", "ER", "NCR", "WCR", "SWR", "SCR", "ECR", "NWR"];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [22.5, 79.5],
      zoom: 5,
      zoomControl: true,
      minZoom: 4,
      maxZoom: 16,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Carto style
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | RailTrack India',
      maxZoom: 18,
    }).addTo(map);

    // Filter stations by zone
    const filteredStations = selectedZone === "ALL"
      ? data.stations
      : data.stations.filter(s => s.zone === selectedZone);

    // Add Train Routes
    if (showRoutes) {
      data.routes.forEach(route => {
        if (route.coordinates.length > 1) {
          const polyline = L.polyline(route.coordinates, {
            color: '#2563eb',
            weight: 3,
            opacity: 0.65,
            dashArray: '6, 6'
          }).addTo(map);

          polyline.bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px;">
              <b style="color: #1e3a8a;">${route.train_name}</b> (${route.train_number})<br>
              <span style="color: #64748b;">${route.category}</span><br>
              Route: <b>${route.source_code}</b> → <b>${route.destination_code}</b>
            </div>
          `);
        }
      });
    }

    // Add Stations
    markersRef.current = {};
    filteredStations.forEach(st => {
      const isSelected = selectedStationCode && selectedStationCode.toUpperCase() === st.code.toUpperCase();
      const markerColor = isSelected ? '#ea580c' : '#1e3a8a';
      const size = isSelected ? 18 : 12;

      const stationIcon = L.divIcon({
        className: 'station-dot-icon',
        html: `<div style="background-color: ${markerColor}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([st.latitude, st.longitude], { icon: stationIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <div style="font-weight: bold; font-size: 14px; color: #0f172a;">${st.name}</div>
          <div style="color: #ea580c; font-weight: 600; margin-top: 1px;">Station Code: ${st.code}</div>
          <div style="color: #475569; margin-top: 4px;">
            Zone: <b>${st.zone || 'IR'}</b> | State: <b>${st.state}</b><br>
            Platforms: <b>${st.platforms}</b> | Category: <b>${st.category || 'Standard'}</b>
          </div>
          <a href="/stations/${st.code}" style="display: inline-block; margin-top: 8px; color: #2563eb; font-weight: 600; text-decoration: none;">
            View Station Board & Timetable →
          </a>
        </div>
      `);
      markersRef.current[st.code] = marker;
    });

    // Add Live Trains
    if (showLiveTrains) {
      data.live_trains.forEach(lt => {
        const isDelayed = lt.delay_minutes > 15;
        const color = isDelayed ? '#d97706' : '#16a34a';

        const liveTrainIcon = L.divIcon({
          className: 'live-train-marker',
          html: `
            <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 14px; height: 14px; background: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.4); z-index: 10;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const trainMarker = L.marker([lt.latitude, lt.longitude], { icon: liveTrainIcon }).addTo(map);
        trainMarker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <b style="color: #0f172a; font-size: 13px;">${lt.train_name}</b><br>
            <span style="font-mono font-bold;">Train #${lt.train_number}</span> (${lt.category})<br>
            Status: <b style="color: ${color};">${lt.status}</b> (${lt.delay_minutes}m delay)<br>
            Speed: <b>${lt.speed_kmh} km/h</b> | Progress: <b>${lt.progress_percentage}%</b><br>
            <a href="/live-status/${lt.train_number}" style="display: inline-block; margin-top: 6px; color: #ea580c; font-weight: 600; text-decoration: none;">
              Track Running Status →
            </a>
          </div>
        `);
      });
    }

    // Pan to selected station if given
    if (selectedStationCode && markersRef.current[selectedStationCode.toUpperCase()]) {
      const m = markersRef.current[selectedStationCode.toUpperCase()];
      map.setView(m.getLatLng(), 8);
      m.openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data, selectedZone, showRoutes, showLiveTrains, selectedStationCode]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([22.5, 79.5], 5);
    }
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 z-0">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Filters */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-railway-navy" />
          <span className="font-semibold text-slate-700">Zone:</span>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="bg-slate-100 rounded px-2 py-1 font-semibold text-slate-800 border-none focus:ring-1 focus:ring-railway-navy text-xs outline-none"
          >
            {zones.map(z => (
              <option key={z} value={z}>{z === 'ALL' ? 'All Zones (National)' : `${z} Zone`}</option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-md flex items-center gap-4 text-xs font-semibold text-slate-700">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              className="rounded text-railway-navy focus:ring-0"
            />
            <span>Routes</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showLiveTrains}
              onChange={(e) => setShowLiveTrains(e.target.checked)}
              className="rounded text-railway-navy focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live Trains</span>
            </span>
          </label>
          <button
            onClick={handleResetView}
            className="flex items-center gap-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
            title="Reset Pan & Zoom"
          >
            <Compass className="w-3.5 h-3.5 text-railway-blue" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur px-4 py-2 rounded-xl border border-slate-200 text-xs shadow-md flex items-center gap-4 font-medium text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#1e3a8a] border border-white"></span>
          <span>Station Junction</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white animate-pulse"></span>
          <span>Running Train</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 border-b-2 border-dashed border-blue-600"></span>
          <span>Trunk Route</span>
        </div>
      </div>
    </div>
  );
};
