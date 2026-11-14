import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { SystemHealth } from '../types';
import {
  Server,
  Database,
  Radio,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Code2
} from 'lucide-react';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const SystemStatusPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHealth = async () => {
      setLoading(true);
      try {
        const data = await api.system.getHealth();
        setHealth(data);
      } catch (err) {
        console.error("Health fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <Server className="w-6 h-6 text-railway-navy" />
          <span>Indian Railways System & API Infrastructure Status</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Operational metrics, data provider health, rate limits, and OpenAPI documentation endpoints.
        </p>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : !health ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          Could not contact the backend API service.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">All National Services Operational</h2>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <p className="text-xs text-emerald-200 mt-0.5">
                    FastAPI backend, database connectors, and telemetry services running normally.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Code2 className="w-4 h-4" />
                  <span>OpenAPI Swagger UI</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Infrastructure Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Database State</span>
                <Database className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold text-emerald-600 font-mono">
                {health.database}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">PostgreSQL / SQLAlchemy</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">System Uptime</span>
                <Clock className="w-4 h-4 text-railway-blue" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {formatUptime(health.uptime_seconds)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Continuous operation</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Monitored Trains</span>
                <Radio className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {health.active_trains_count} Trains
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active in registry</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold uppercase">Station Network</span>
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {health.active_stations_count} Stations
              </div>
              <div className="text-[11px] text-slate-400 mt-1">With platform data</div>
            </div>
          </div>

          {/* Connected Data Sources List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-slate-900 text-base mb-1">Connected Railway Data Sources</h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time connectors powering timetable lookups and running status
            </p>

            <div className="space-y-3">
              {health.data_sources.map((ds) => (
                <div
                  key={ds.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{ds.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {ds.source_type}
                      </span>
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      Endpoint: {ds.endpoint_url || 'Internal Feed'} • Sync: Every {ds.sync_interval_seconds}s
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ds.is_live_verified ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        LIVE VERIFIED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                        DEMO / SIMULATION
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                      {ds.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* API Developer Reference Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="font-bold text-slate-900 text-base mb-1">Developer API Information</h3>
            <p className="text-xs text-slate-500 mb-4">
              REST API specifications and integration guidelines for external railway information systems
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Available Documentation</h4>
                <ul className="space-y-1.5 text-slate-600">
                  <li>
                    <a href="/api/docs" target="_blank" rel="noreferrer" className="text-railway-navy font-semibold hover:underline">
                      • Swagger UI Documentation (/api/docs)
                    </a>
                  </li>
                  <li>
                    <a href="/api/redoc" target="_blank" rel="noreferrer" className="text-railway-navy font-semibold hover:underline">
                      • ReDoc Interactive Specification (/api/redoc)
                    </a>
                  </li>
                  <li>
                    <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="text-railway-navy font-semibold hover:underline">
                      • Raw OpenAPI 3.1 JSON Schema (/api/openapi.json)
                    </a>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Rate Limits & Policies</h4>
                <ul className="space-y-1 text-slate-600 text-[11px]">
                  <li>• Default quota: 120 requests/minute per IP address.</li>
                  <li>• JWT authentication: Pass <code className="bg-slate-200 px-1 rounded">Bearer &lt;token&gt;</code> in Authorization header.</li>
                  <li>• Official disclaimer: Mock/simulation feeds are explicitly tagged and must not be presented as certified telemetry to end-users.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
