import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { StopLiveProgress } from '../../types';

interface Props {
  stops: StopLiveProgress[];
}

export const DelayChart: React.FC<Props> = ({ stops }) => {
  if (!stops || stops.length === 0) return null;

  const chartData = stops.map((s) => ({
    name: s.station_code,
    fullName: s.station_name,
    delay: s.delay_minutes,
    distance: s.distance_km,
  }));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900 text-base">Station Delay & Progress Analysis</h3>
        <p className="text-xs text-slate-500">
          Cumulative transit delay (in minutes) across route intermediate stations
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="delayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              unit="m"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#1e293b',
                color: '#fff',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(val: any) => [`${val} min delay`, 'Delay']}
              labelFormatter={(label: any) => {
                const item = chartData.find(d => d.name === label);
                return `${item?.fullName} (${label})`;
              }}
            />
            <Area
              type="monotone"
              dataKey="delay"
              stroke="#ea580c"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#delayGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
