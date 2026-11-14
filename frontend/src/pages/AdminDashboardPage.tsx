import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AdminStats, AuditLog, DataSource } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Shield,
  Upload,
  Database,
  Radio,
  Users,
  Train,
  MapPin,
  Activity,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { TableSkeleton } from '../components/common/LoadingSkeleton';

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  // File upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [s, logs, ds] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAuditLogs(20),
        api.system.getDataSources(),
      ]);
      setStats(s);
      setAuditLogs(logs);
      setDataSources(ds);
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast("Could not load administrative data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast("Please select a CSV file first", "warning");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await api.admin.importCsv(formData);
      toast(`Successfully imported ${result.imported_count} trains!`, "success");
      setFile(null);
      fetchAdminData();
    } catch (err: any) {
      toast(err.response?.data?.detail || "CSV import failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleVerified = async (ds: DataSource) => {
    try {
      await api.admin.updateDataSource(ds.id, {
        is_live_verified: !ds.is_live_verified
      });
      toast(`Updated ${ds.name} verified mode`, "success");
      fetchAdminData();
    } catch (err) {
      toast("Failed to update data source", "error");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-slate-200">
        <Shield className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Administrator Credentials Required</h2>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
          You must be logged in as an administrator (e.g. admin@railtrack.gov.in) to access system settings and audit logs.
        </p>
        <a
          href="/login"
          className="px-4 py-2 bg-railway-navy text-white text-xs font-bold rounded-xl"
        >
          Sign In as Admin
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-railway-accent" />
            <span>National Railway Operations & Admin Portal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System administration, dataset batch ingestion, telemetry feeds, and audit trail.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Operations</span>
        </button>
      </div>

      {/* Stats 4-Card Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Total Trains</span>
              <Train className="w-4 h-4 text-railway-blue" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.total_trains}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Operating schedules</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Total Stations</span>
              <MapPin className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.total_stations}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Junctions & Terminals</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Registered Users</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.total_users}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Passenger accounts</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase">Data Feeds</span>
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.data_sources_count}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Active sync connectors</div>
          </div>
        </div>
      )}

      {/* CSV Batch Ingestion Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-railway-accent flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Batch Dataset CSV Import</h2>
            <p className="text-xs text-slate-500">
              Upload official timetable spreadsheets (CSV format with train_number, train_name, source, dest).
            </p>
          </div>
        </div>

        <form onSubmit={handleFileUpload} className="mt-4 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-railway-navy file:text-white hover:file:bg-railway-blue cursor-pointer"
          />

          <button
            type="submit"
            disabled={uploading || !file}
            className="px-6 py-2.5 bg-railway-accent hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? "Ingesting..." : "Import CSV Data"}</span>
          </button>
        </form>
      </div>

      {/* Data Sources and Verification Status */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Radio className="w-5 h-5 text-emerald-500" />
          <span>Telemetry & Data Source Configuration</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Requirement #11: Clearly differentiate genuine LIVE verified data from DEMO / SIMULATION mode.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Source Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Endpoint</th>
                <th className="py-3 px-4">Interval</th>
                <th className="py-3 px-4">Live Verified Mode</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataSources.map((ds) => (
                <tr key={ds.id} className="hover:bg-slate-50/50">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{ds.name}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ds.source_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{ds.endpoint_url || 'N/A (Built-in)'}</td>
                  <td className="py-3.5 px-4 font-mono">{ds.sync_interval_seconds}s</td>
                  <td className="py-3.5 px-4">
                    {ds.is_live_verified ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>LIVE VERIFIED</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>DEMO / SIMULATION</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleVerified(ds)}
                      className="px-3 py-1 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      Toggle Mode
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          <span>System Audit Trail</span>
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Immutable logging of administrative actions, data ingestions, and updates
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {log.user_email || 'System'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{log.entity_type}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
