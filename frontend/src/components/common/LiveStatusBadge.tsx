import React from 'react';
import { Radio, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  dataSourceType?: string;
  isLiveVerified?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const LiveStatusBadge: React.FC<Props> = ({
  dataSourceType = 'DEMO_DATA',
  isLiveVerified = false,
  size = 'md',
}) => {
  const isLive = isLiveVerified && dataSourceType === 'LIVE_VERIFIED';
  const isDemo = !isLive && (dataSourceType === 'DEMO_DATA' || dataSourceType === 'INTERNAL_SIMULATOR');

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wide',
  };

  if (isLive) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 ${sizeClasses[size]}`}
        title="Live telemetry verified from railway signalling feed"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
        <span>LIVE VERIFIED</span>
      </span>
    );
  }

  if (isDemo) {
    return (
      <span
        className={`inline-flex items-center rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 ${sizeClasses[size]}`}
        title="Demonstration feed: Real-time simulation active, official live API not connected"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>DEMO DATA / SIMULATION</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-blue-500/15 text-blue-700 border border-blue-500/30 ${sizeClasses[size]}`}
      title="Scheduled timetable projection based on published train schedule"
    >
      <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      <span>SCHEDULED INFORMATION</span>
    </span>
  );
};
