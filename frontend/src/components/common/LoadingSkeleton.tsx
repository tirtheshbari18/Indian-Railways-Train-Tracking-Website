import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-5 bg-slate-200 rounded w-40"></div>
        <div className="h-4 bg-slate-100 rounded w-24"></div>
      </div>
      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
    </div>
    <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
      <div className="h-8 bg-slate-100 rounded"></div>
      <div className="h-8 bg-slate-100 rounded"></div>
      <div className="h-8 bg-slate-100 rounded"></div>
    </div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-4 bg-slate-100 rounded w-32"></div>
      <div className="h-9 bg-slate-200 rounded w-28"></div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse">
    <div className="h-12 bg-slate-100 border-b border-slate-200"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-14 border-b border-slate-100 px-4 flex items-center space-x-4">
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 rounded w-2/6"></div>
        <div className="h-4 bg-slate-200 rounded w-1/6"></div>
        <div className="h-4 bg-slate-200 rounded w-2/6"></div>
      </div>
    ))}
  </div>
);
