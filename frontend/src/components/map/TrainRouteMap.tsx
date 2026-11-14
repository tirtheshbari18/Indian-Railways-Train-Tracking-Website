import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';

interface Props {
  trainNumber?: string;
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
  trainNumber,
  coordinates,
  stops,
  currentLocation,
  height = "480px"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const trainMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const prevRouteKeyRef = useRef<string>('');

  // Helper to re-center on train
  const handleRecenterTrain = () => {
    if (mapInstanceRef.current && currentLocation?.latitude && currentLocation?.longitude) {
      mapInstanceRef.current.setView([currentLocation.latitude, currentLocation.longitude], 8, {
        animate: true
      });
      if (trainMarkerRef.current) {
        trainMarkerRef.current.openPopup();
      }
    }
  };

  // Helper to fit entire route
  const handleFitRoute = () => {
    if (mapInstanceRef.current && polylineRef.current) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [50, 50], animate: true });
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Unique key identifying this exact route
    const currentTrainId = trainNumber || currentLocation?.train_number || '';
    const stopCodes = stops.map(s => s.station_code).join('-');
    const firstCoord = coordinates[0] ? `${coordinates[0][0].toFixed(3)},${coordinates[0][1].toFixed(3)}` : '';
    const lastCoord = coordinates[coordinates.length - 1] ? `${coordinates[coordinates.length - 1][0].toFixed(3)},${coordinates[coordinates.length - 1][1].toFixed(3)}` : '';
    const routeIdentifier = `${currentTrainId}__${stopCodes}__${coordinates.length}__${firstCoord}__${lastCoord}`;

    const isNewRoute = prevRouteKeyRef.current !== routeIdentifier;

    // Create map instance if not already initialized
    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = coordinates.length > 0 ? coordinates[0] : [22.5937, 78.9629];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });
      mapInstanceRef.current = map;

      // Base OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Indian Railways Telematics',
        maxZoom: 18,
      }).addTo(map);
    }

    const map = mapInstanceRef.current;

    // If route changed or first render, rebuild route layers
    if (isNewRoute) {
      prevRouteKeyRef.current = routeIdentifier;

      // Remove existing polylines, circle markers, and markers
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline || layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });
      trainMarkerRef.current = null;
      polylineRef.current = null;

      // 1. Underlay track bed casing line (dark slate)
      if (coordinates.length > 0) {
        L.polyline(coordinates, {
          color: '#0f172a',
          weight: 6,
          opacity: 0.7,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);

        // 2. Active Railway Corridor Line (high-visibility cyan/blue)
        const polyline = L.polyline(coordinates, {
          color: '#0284c7',
          weight: 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(map);
        polylineRef.current = polyline;

        // Auto-fit route bounds with pleasant padding
        try {
          map.fitBounds(polyline.getBounds(), { padding: [50, 50], animate: true });
        } catch (e) {
          // ignore fitBounds if geometry single point
        }
      }

      // 3. Station markers
      const createStationIcon = (isOrigin: boolean, isDest: boolean) => {
        const color = isOrigin ? '#16a34a' : isDest ? '#dc2626' : '#2563eb';
        const size = isOrigin || isDest ? 14 : 10;
        return L.divIcon({
          className: 'custom-station-icon',
          html: `
            <div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.5);"></div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      };

      stops.forEach((stop, idx) => {
        const isOrigin = idx === 0;
        const isDest = idx === stops.length - 1;
        const icon = createStationIcon(isOrigin, isDest);

        const marker = L.marker([stop.latitude, stop.longitude], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 170px;">
            <div style="font-weight: bold; font-size: 13px; color: #0f172a;">
              ${stop.station_name}
            </div>
            <div style="color: #ea580c; font-weight: 600; font-family: monospace;">
              Station Code: ${stop.station_code}
            </div>
            <div style="color: #64748b; margin-top: 2px;">
              Stop #${stop.sequence} ${isOrigin ? '(Source Terminal)' : isDest ? '(Destination)' : ''}
            </div>
            <div style="margin-top: 6px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              ${stop.scheduled_arrival ? `<div>Arr: <b>${stop.scheduled_arrival}</b></div>` : ''}
              ${stop.scheduled_departure ? `<div>Dep: <b>${stop.scheduled_departure}</b></div>` : ''}
              ${stop.halt_minutes > 0 ? `<div style="color: #ea580c;">Halt: <b>${stop.halt_minutes} mins</b></div>` : ''}
            </div>
          </div>
        `);
      });
    }

    // 4. Live Train GPS Marker
    if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      const trainIcon = L.divIcon({
        className: 'current-live-train-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: -4px; background: rgba(234, 88, 12, 0.3); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 1px; background: rgba(234, 88, 12, 0.35); border-radius: 50%;"></div>
            <div style="width: 22px; height: 22px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5); z-index: 10; display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="16" height="16" x="4" y="3" rx="2"/>
                <path d="M4 11h16"/>
                <path d="M12 3v8"/>
                <path d="m8 19-2 3"/>
                <path d="m18 22-2-3"/>
                <circle cx="8" cy="15" r="1"/>
                <circle cx="16" cy="15" r="1"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 170px;">
          <div style="display: flex; align-items: center; gap: 4px; color: #ea580c; font-weight: bold; font-size: 13px;">
            <span style="display: inline-block; width: 8px; height: 8px; background: #16a34a; border-radius: 50%;"></span>
            Live Train Telemetry
          </div>
          <div style="font-weight: 600; color: #0f172a; margin-top: 2px;">
            Train #${currentLocation.train_number || 'Live'}
          </div>
          <div style="margin-top: 4px; padding: 4px 6px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            Speed: <b style="color: #0284c7;">${currentLocation.speed_kmh ? `${currentLocation.speed_kmh.toFixed(1)} km/h` : 'Cruising'}</b><br>
            Coordinates: <span style="font-family: monospace; font-size: 11px;">${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)}</span>
          </div>
        </div>
      `;

      if (trainMarkerRef.current) {
        trainMarkerRef.current.setLatLng([currentLocation.latitude, currentLocation.longitude]);
        trainMarkerRef.current.setPopupContent(popupContent);
      } else {
        const marker = L.marker([currentLocation.latitude, currentLocation.longitude], {
          icon: trainIcon,
          zIndexOffset: 1000
        }).addTo(map);
        marker.bindPopup(popupContent);
        trainMarkerRef.current = marker;
      }
    }

  }, [trainNumber, coordinates, stops, currentLocation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 z-0">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Floating Map Controls */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 shadow-md">
        {currentLocation && (
          <button
            onClick={handleRecenterTrain}
            title="Center on Live Train"
            className="p-2 bg-white/95 hover:bg-white text-slate-700 hover:text-railway-navy rounded-lg border border-slate-200 shadow-sm transition-colors flex items-center justify-center"
          >
            <LocateFixed className="w-4 h-4 text-orange-600 animate-pulse" />
          </button>
        )}
        <button
          onClick={handleFitRoute}
          title="Fit Route to Screen"
          className="px-2 py-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-railway-navy rounded-lg border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
        >
          Fit Route
        </button>
      </div>

      {/* Legend Bar */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 text-xs flex flex-wrap items-center gap-3 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600 font-medium">Origin Terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-slate-600 font-medium">Intermediate Halt</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span className="text-slate-600 font-medium">Destination</span>
        </div>
        {currentLocation && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-orange-600 font-bold">Live GPS Telemetry</span>
          </div>
        )}
      </div>
    </div>
  );
};
