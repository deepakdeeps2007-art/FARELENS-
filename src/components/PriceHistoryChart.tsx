'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PriceSnapshot } from '@/core/types/index';
import { formatINR } from '@/core/pricing/index';
import { ProvenanceBadge } from './ProvenanceBadge';
import { TrendingDown, AlertCircle } from 'lucide-react';

interface PriceHistoryChartProps {
  snapshots: PriceSnapshot[];
  currentPrice: number;
}

export function PriceHistoryChart({ snapshots, currentPrice }: PriceHistoryChartProps) {
  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
        <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Historical Observations Yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Price tracking has just begun for this trip. Check back in a few hours to see the fare trend.
        </p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = snapshots.map((s, idx) => {
    const d = new Date(s.capturedAt);
    const timeLabel = d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return {
      time: timeLabel,
      price: s.finalPrice,
      seats: s.seatsAvailable || 'N/A',
      isLatest: idx === snapshots.length - 1,
    };
  });

  const prices = snapshots.map((s) => s.finalPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900">Observed Fare Movement</h4>
            <ProvenanceBadge provenance="HISTORICAL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Recorded across {snapshots.length} observation snapshots
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">72h Low</span>
            <span className="font-extrabold text-emerald-600 tabular-nums">{formatINR(minPrice)}</span>
          </div>
          <div className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="text-slate-400 block text-[10px]">72h High</span>
            <span className="font-extrabold text-slate-700 tabular-nums">{formatINR(maxPrice)}</span>
          </div>
        </div>
      </div>

      {/* Recharts Component */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={[Math.floor(minPrice * 0.95), Math.ceil(maxPrice * 1.05)]}
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg border border-slate-800 space-y-1">
                      <p className="font-medium text-slate-300">{data.time}</p>
                      <p className="text-sm font-bold text-emerald-400 tabular-nums">
                        {formatINR(data.price)}
                      </p>
                      {data.seats !== 'N/A' && (
                        <p className="text-[10px] text-slate-400">
                          Observed Seats Left: <span className="text-white font-semibold">{data.seats}</span>
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#059669"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#059669', strokeWidth: 1, stroke: '#fff' }}
              activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-400 flex items-center justify-between">
        <span>* Snapshots captured during periodic tracking cycles.</span>
        <span className="font-medium text-slate-600">Current Payable: {formatINR(currentPrice)}</span>
      </div>
    </div>
  );
}
