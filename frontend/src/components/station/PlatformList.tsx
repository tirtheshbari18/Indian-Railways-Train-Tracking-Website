import React from 'react';
import { Platform } from '../../types';
import { Accessibility, ArrowUp, Check, ShieldCheck } from 'lucide-react';

interface Props {
  platforms: Platform[];
  stationName: string;
}

export const PlatformList: React.FC<Props> = ({ platforms, stationName }) => {
  if (!platforms || platforms.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-sm text-slate-500">
        No platform infrastructure verified data recorded for this station yet.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Verified Platform Facilities</h3>
          <p className="text-xs text-slate-500">
            {platforms.length} operational passenger platforms at {stationName}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Station Infrastructure Verified</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {platforms.map((p) => (
          <div
            key={p.id}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                Platform {p.platform_number}
              </span>
              {p.length_meters && (
                <span className="text-[11px] text-slate-400 font-mono">
                  {p.length_meters}m
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs text-slate-600 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Escalator:</span>
                <span className={p.has_escalator ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {p.has_escalator ? "Available" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Elevator / Lift:</span>
                <span className={p.has_lift ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {p.has_lift ? "Available" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Wheelchair Access:</span>
                <span className={p.is_accessible ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {p.is_accessible ? "Yes (Divyangjan)" : "No"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
