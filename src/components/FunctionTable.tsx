import { useState } from 'react';
import type { RecruitingFunction, ModelMetrics, GlobalAssumptions } from '../types';

interface Props {
  functions: RecruitingFunction[];
  metrics: ModelMetrics;
  assumptions: GlobalAssumptions;
  onUpdate: (id: string, updates: Partial<Omit<RecruitingFunction, 'id'>>) => void;
  onDelete: (id: string) => void;
  onAdd: (fn: Omit<RecruitingFunction, 'id'>) => void;
}

const BLANK_FN: Omit<RecruitingFunction, 'id'> = {
  name: '',
  ftRecruiterCount: 1,
  contractRecruiterCount: 0,
  hiredPerQuarter: 5,
};

function NumInput({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      step={step}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v) && v >= min) onChange(v);
      }}
      className="w-16 px-1.5 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-center bg-gray-50 hover:bg-white transition-colors"
    />
  );
}

function GapBadge({ gap }: { gap: number }) {
  const isSurplus = gap >= 0;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
        isSurplus
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
      }`}
    >
      {isSurplus ? '+' : '−'}
      {Math.abs(gap).toFixed(1)}
    </span>
  );
}

export function FunctionTable({ functions, metrics, assumptions, onUpdate, onDelete, onAdd }: Props) {
  const [newFn, setNewFn] = useState<Omit<RecruitingFunction, 'id'>>(BLANK_FN);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const metricsById = Object.fromEntries(metrics.functions.map((m) => [m.id, m]));

  function handleAdd() {
    if (!newFn.name.trim()) return;
    onAdd(newFn);
    setNewFn(BLANK_FN);
    setShowAdd(false);
  }

  const thClass = 'px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap';
  const tdClass = 'px-3 py-3 text-sm text-gray-700';
  const calcTd = 'px-3 py-3 text-sm text-gray-500 text-right tabular-nums';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
          By Function
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Function
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {/* Editable columns */}
              <th className={thClass}>Function</th>
              <th className={`${thClass} text-center`}>FT Recruiters</th>
              <th className={`${thClass} text-center`}>Contract</th>
              <th className={`${thClass} text-center`}>Planned Hires / Q</th>
              {/* Calculated columns */}
              <th className={`${thClass} text-right`} title="Attrition hires allocated to this function">
                Attrition Share
              </th>
              <th className={`${thClass} text-right`} title="Open roles allocated to this function">
                Open Roles Share
              </th>
              <th className={`${thClass} text-right`}>Total Demand</th>
              <th className={`${thClass} text-right`}>FT Capacity</th>
              <th className={`${thClass} text-right`}>Contract Capacity</th>
              <th className={`${thClass} text-right`}>Total Capacity</th>
              <th className={`${thClass} text-right`}>Gap / Surplus</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {functions.map((fn) => {
              const m = metricsById[fn.id];
              if (!m) return null;
              return (
                <tr key={fn.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Editable: name */}
                  <td className={tdClass}>
                    <input
                      type="text"
                      value={fn.name}
                      onChange={(e) => onUpdate(fn.id, { name: e.target.value })}
                      className="w-32 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
                    />
                  </td>
                  {/* Editable: FT recruiters */}
                  <td className={`${tdClass} text-center`}>
                    <NumInput
                      value={fn.ftRecruiterCount}
                      onChange={(v) => onUpdate(fn.id, { ftRecruiterCount: v })}
                    />
                  </td>
                  {/* Editable: contract recruiters */}
                  <td className={`${tdClass} text-center`}>
                    <NumInput
                      value={fn.contractRecruiterCount}
                      onChange={(v) => onUpdate(fn.id, { contractRecruiterCount: v })}
                    />
                  </td>
                  {/* Editable: planned hires */}
                  <td className={`${tdClass} text-center`}>
                    <NumInput
                      value={fn.hiredPerQuarter}
                      min={0}
                      onChange={(v) => onUpdate(fn.id, { hiredPerQuarter: v })}
                    />
                  </td>
                  {/* Calculated fields */}
                  <td className={calcTd}>{m.attritionHiresShare.toFixed(1)}</td>
                  <td className={calcTd}>{m.openRolesShare.toFixed(1)}</td>
                  <td className={`${calcTd} font-medium text-gray-800`}>{m.totalDemand.toFixed(1)}</td>
                  <td className={calcTd}>{m.ftCapacity.toFixed(0)}</td>
                  <td className={calcTd}>{m.contractCapacity.toFixed(0)}</td>
                  <td className={`${calcTd} font-medium text-gray-800`}>{m.totalCapacity.toFixed(0)}</td>
                  <td className={`${calcTd}`}>
                    <div className="flex justify-end">
                      <GapBadge gap={m.gap} />
                    </div>
                  </td>
                  {/* Delete */}
                  <td className="px-3 py-3">
                    {deletingId === fn.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { onDelete(fn.id); setDeletingId(null); }}
                          className="text-xs px-2 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(fn.id)}
                        className="p-1.5 text-gray-300 hover:text-rose-400 transition-colors rounded"
                        aria-label="Delete function"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Add new function inline form */}
            {showAdd && (
              <tr className="bg-indigo-50/40 border-t-2 border-indigo-100">
                <td className={tdClass}>
                  <input
                    type="text"
                    placeholder="Function name"
                    value={newFn.name}
                    autoFocus
                    onChange={(e) => setNewFn((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    className="w-32 px-2 py-1 text-sm border border-indigo-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                  />
                </td>
                <td className={`${tdClass} text-center`}>
                  <NumInput value={newFn.ftRecruiterCount} onChange={(v) => setNewFn((p) => ({ ...p, ftRecruiterCount: v }))} />
                </td>
                <td className={`${tdClass} text-center`}>
                  <NumInput value={newFn.contractRecruiterCount} onChange={(v) => setNewFn((p) => ({ ...p, contractRecruiterCount: v }))} />
                </td>
                <td className={`${tdClass} text-center`}>
                  <NumInput value={newFn.hiredPerQuarter} onChange={(v) => setNewFn((p) => ({ ...p, hiredPerQuarter: v }))} />
                </td>
                {/* Calculated placeholders */}
                <td colSpan={7} className="px-3 py-3 text-xs text-gray-400 italic">
                  Calculated after adding…
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    <button
                      onClick={handleAdd}
                      disabled={!newFn.name.trim()}
                      className="text-xs px-3 py-1 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAdd(false); setNewFn(BLANK_FN); }}
                      className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-medium hover:bg-gray-200"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

          {/* Totals footer */}
          <tfoot className="bg-gray-50 border-t-2 border-gray-200">
            <tr>
              <td className="px-3 py-3 text-sm font-bold text-gray-800">Total</td>
              <td className="px-3 py-3 text-sm text-center font-medium text-gray-600">
                {metrics.totals.totalFtRecruiters}
              </td>
              <td className="px-3 py-3 text-sm text-center font-medium text-gray-600">
                {metrics.totals.totalContractRecruiters}
              </td>
              <td className="px-3 py-3 text-sm text-center font-medium text-gray-600">
                {metrics.totals.plannedHires.toFixed(0)}
              </td>
              <td className="px-3 py-3 text-sm text-right font-medium text-gray-600">
                {metrics.totals.attritionHires.toFixed(1)}
              </td>
              <td className="px-3 py-3 text-sm text-right font-medium text-gray-600">
                {metrics.totals.openRoles.toFixed(0)}
              </td>
              <td className="px-3 py-3 text-sm text-right font-bold text-gray-900">
                {metrics.totals.totalDemand.toFixed(1)}
              </td>
              <td className="px-3 py-3 text-sm text-right font-medium text-gray-600">
                {metrics.totals.ftCapacity.toFixed(0)}
              </td>
              <td className="px-3 py-3 text-sm text-right font-medium text-gray-600">
                {metrics.totals.contractCapacity.toFixed(0)}
              </td>
              <td className="px-3 py-3 text-sm text-right font-bold text-gray-900">
                {metrics.totals.totalCapacity.toFixed(0)}
              </td>
              <td className="px-3 py-3 text-right">
                <GapBadge gap={metrics.totals.gap} />
              </td>
              <td />
            </tr>
            {/* Productivity legend row */}
            <tr>
              <td colSpan={12} className="px-3 py-2 text-xs text-gray-400 border-t border-gray-100">
                Productivity assumptions — FT: {assumptions.ftProductivity} hires/recruiter/Q &nbsp;·&nbsp; Contract: {assumptions.contractProductivity} hires/recruiter/Q
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
