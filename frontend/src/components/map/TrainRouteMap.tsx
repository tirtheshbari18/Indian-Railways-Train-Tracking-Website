import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Props {
  coordinates: [number, number][];
  stops: {
    sequence: number;
    station_code: string;
    station_name: string;
    latitude: number;
    longitude: number;
    scheduled_arrival?: string;
    scheduled_departure?: string;
    halt_minutes: number;
  }[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    speed_kmh?: number;
    train_number?: string;
  };
  height?: string;
}

export const TrainRouteMap: React.FC<Props> = ({
  coordinates,
  stops,
  currentLocation,
  height = "420px"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center to India coordinates
    const defaultCenter: [number, number] = coordinates.length > 0 ? coordinates[0] : [22.5937, 78.9629];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    mapInstanceRef.current = map;

    // Tile layer - Clean OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    // Add polyline for route
    if (coordinates.length > 0) {
      const polyline = L.polyline(coordinates, {
        color: '#1e3a8a',
        weight: 4,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: undefined
      }).addTo(map);

      // Fit bounds
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    // Custom Station Marker Icon
    const createStationIcon = (isOrigin: boolean, isDest: boolean) => {
      const color = isOrigin ? '#16a34a' : isDest ? '#dc2626' : '#2563eb';
      return L.divIcon({
        className: 'custom-station-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
    };

    // Add stops markers
    stops.forEach((stop, idx) => {
      const isOrigin = idx === 0;
      const isDest = idx === stops.length - 1;
      const icon = createStationIcon(isOrigin, isDest);

      const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <div style="font-weight: bold; font-size: 13px; color: #0f172a;">
            ${stop.station_name} (<span style="color: #ea580c;">${stop.station_code}</span>)
          </div>
          <div style="color: #64748b; margin-top: 2px;">
            Stop #${stop.sequence} ${isOrigin ? '(Source)' : isDest ? '(Destination)' : ''}
          </div>
          <div style="margin-top: 4px; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            ${stop.scheduled_arrival ? `Arr: <b>${stop.scheduled_arrival}</b> &nbsp;` : ''}
            ${stop.scheduled_departure ? `Dep: <b>${stop.scheduled_departure}</b>` : ''}
            ${stop.halt_minutes > 0 ? `<br>Halt: ${stop.halt_minutes} mins` : ''}
          </div>
        </div>
      `);
    });

    // Add Current Live Train Location Marker
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      const trainIcon = L.divIcon({
        className: 'current-train-marker',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; background: #ea580c; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 18px; height: 18px; background: #ea580c; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4); z-index: 10;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const trainMarker = L.marker([currentLocation.latitude, currentLocation.longitude], { icon: trainIcon }).addTo(map);
      trainMarker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px;">
          <b style="color: #ea580c; font-size: 13px;">Live Train Position</b><br>
          ${currentLocation.train_number ? `Train #${currentLocation.train_number}<br>` : ''}
          ${currentLocation.speed_kmh ? `Reported Speed: <b>${currentLocation.speed_kmh} km/h</b>` : ''}
        </div>
      `).openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coordinates, stops, currentLocation]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 z-0">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs flex items-center gap-3 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600 font-medium">Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-slate-600 font-medium">Intermediate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span className="text-slate-600 font-medium">Destination</span>
        </div>
        {currentLocation && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-orange-600 font-bold">Reported GPS</span>
          </div>
        )}
      </div>
    </div>
  );
};
