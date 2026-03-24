import type { GlobalAssumptions } from '../types';

interface Props {
  assumptions: GlobalAssumptions;
  onChange: (updates: Partial<GlobalAssumptions>) => void;
}

interface FieldProps {
  label: string;
  hint: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}

function Field({ label, hint, value, min = 0, max, step = 1, suffix, onChange }: FieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!isNaN(v)) onChange(Math.max(min, max !== undefined ? Math.min(max, v) : v));
          }}
          className="w-24 text-right px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-gray-50"
        />
        {suffix && <span className="text-sm text-gray-400 w-6">{suffix}</span>}
      </div>
    </div>
  );
}

export function AssumptionsPanel({ assumptions, onChange }: Props) {
  const attritionHires = (assumptions.totalEmployees * assumptions.attritionRate) / 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-0">
      <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase mb-4">
        Global Assumptions
      </h2>

      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Workforce
        </p>
        <Field
          label="Total Employees"
          hint="Current headcount"
          value={assumptions.totalEmployees}
          min={1}
          onChange={(v) => onChange({ totalEmployees: v })}
        />
        <Field
          label="Annual Attrition Rate"
          hint={`≈ ${attritionHires.toFixed(1)} attrition hires / quarter`}
          value={assumptions.attritionRate}
          min={0}
          max={100}
          step={0.5}
          suffix="%"
          onChange={(v) => onChange({ attritionRate: v })}
        />
        <Field
          label="Open Roles (Backfill)"
          hint="Unfilled positions to close this quarter"
          value={assumptions.openRoles}
          min={0}
          onChange={(v) => onChange({ openRoles: v })}
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Recruiter Productivity
        </p>
        <Field
          label="FT Recruiter Productivity"
          hint="Hires per full-time recruiter / quarter"
          value={assumptions.ftProductivity}
          min={1}
          step={0.5}
          suffix="×"
          onChange={(v) => onChange({ ftProductivity: v })}
        />
        <Field
          label="Contract Recruiter Productivity"
          hint="Hires per contract recruiter / quarter"
          value={assumptions.contractProductivity}
          min={1}
          step={0.5}
          suffix="×"
          onChange={(v) => onChange({ contractProductivity: v })}
        />
      </div>

      {/* Formula reminder */}
      <div className="mt-5 p-3 bg-indigo-50 rounded-lg text-xs text-indigo-700 leading-relaxed">
        <p className="font-semibold mb-1">How demand is calculated</p>
        <p>
          <span className="font-mono">Demand = PlannedHires + AttritionHires + OpenRoles</span>
        </p>
        <p className="mt-1">
          <span className="font-mono">AttritionHires = Employees × (Rate / 100)</span>
        </p>
        <p className="mt-1 text-indigo-500">
          Attrition and open roles are distributed proportionally across functions by planned hire share.
        </p>
      </div>
    </div>
  );
}
