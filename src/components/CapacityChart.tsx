import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { ModelMetrics } from '../types';

interface Props {
  metrics: ModelMetrics;
}

type Tab = 'demand-capacity' | 'gap';

const fmt = (v: number) => v.toFixed(1);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-6">
          <span style={{ color: p.fill ?? p.color }}>{p.name}</span>
          <span className="font-medium text-gray-700">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GapTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value;
  const isGap = val < 0;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <p className={`font-medium ${isGap ? 'text-rose-600' : 'text-emerald-600'}`}>
        {isGap ? 'Gap: ' : 'Surplus: '}
        {isGap ? fmt(Math.abs(val)) : fmt(val)}
      </p>
      <p className="text-xs text-gray-400 mt-1">{isGap ? 'Under-capacity' : 'Over-capacity'}</p>
    </div>
  );
}

export function CapacityChart({ metrics }: Props) {
  const [tab, setTab] = useState<Tab>('demand-capacity');

  const demandCapacityData = metrics.functions.map((f) => ({
    name: f.name,
    'Total Demand': parseFloat(f.totalDemand.toFixed(1)),
    'Total Capacity': parseFloat(f.totalCapacity.toFixed(1)),
  }));

  const gapData = metrics.functions.map((f) => ({
    name: f.name,
    gap: parseFloat(f.gap.toFixed(1)),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
      {/* Header + tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
          Visualisation
        </h2>
        <div className="flex bg-gray-100 rounded-lg p-0.5 text-sm">
          <button
            onClick={() => setTab('demand-capacity')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              tab === 'demand-capacity'
                ? 'bg-white shadow-sm text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Demand vs Capacity
          </button>
          <button
            onClick={() => setTab('gap')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              tab === 'gap'
                ? 'bg-white shadow-sm text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Gap / Surplus
          </button>
        </div>
      </div>

      {/* Charts */}
      {tab === 'demand-capacity' ? (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={demandCapacityData} barCategoryGap="30%" barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              iconType="square"
              iconSize={10}
            />
            <Bar dataKey="Total Demand" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Total Capacity" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={gapData} barCategoryGap="40%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={36} />
            <Tooltip content={<GapTooltip />} cursor={{ fill: '#f8fafc' }} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1.5} />
            <Bar dataKey="gap" name="Gap / Surplus" radius={[4, 4, 0, 0]}>
              {gapData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.gap >= 0 ? '#10b981' : '#f43f5e'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Totals callout */}
      <div className="flex gap-4 pt-2 border-t border-gray-100 text-sm">
        <div>
          <span className="text-gray-400">Total demand </span>
          <span className="font-semibold text-gray-800">
            {metrics.totals.totalDemand.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Total capacity </span>
          <span className="font-semibold text-gray-800">
            {metrics.totals.totalCapacity.toFixed(1)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Net </span>
          <span
            className={`font-semibold ${
              metrics.totals.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {metrics.totals.gap >= 0 ? '+' : ''}
            {metrics.totals.gap.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}
