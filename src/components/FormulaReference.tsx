import { useState } from 'react';

export function FormulaReference() {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
          Formula Reference
        </h2>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-gray-100">
          <FormulaCard
            title="Attrition Hires"
            formula="totalEmployees × (attritionRate / 100)"
            description="Quarterly headcount replacements due to natural attrition. Distributed to each function proportionally by planned hire share."
            color="amber"
          />
          <FormulaCard
            title="Total Hiring Demand"
            formula="plannedHires + attritionHires + openRoles"
            description="All hires the team must make this quarter: net new growth, attrition backfill, and closing existing open roles."
            color="amber"
          />
          <FormulaCard
            title="Function Demand"
            formula="fnPlanned + (attritionHires × share) + (openRoles × share)"
            description="A function's share of attrition and open roles is its planned hires as a proportion of total planned hires."
            color="amber"
          />
          <FormulaCard
            title="FT Capacity"
            formula="ftRecruiterCount × ftProductivity"
            description="Maximum hires a team of full-time recruiters can close in one quarter at the assumed productivity rate."
            color="indigo"
          />
          <FormulaCard
            title="Contract Capacity"
            formula="contractRecruiterCount × contractProductivity"
            description="Same calculation for contract recruiters. Typically lower productivity to account for ramp time and vendor overhead."
            color="indigo"
          />
          <FormulaCard
            title="Gap / Surplus"
            formula="totalCapacity − totalDemand"
            description="Positive = surplus (more capacity than demand). Negative = gap (more demand than capacity, hiring risk)."
            color="emerald"
          />
        </div>
      )}
    </div>
  );
}

function FormulaCard({
  title,
  formula,
  description,
  color,
}: {
  title: string;
  formula: string;
  description: string;
  color: 'amber' | 'indigo' | 'emerald';
}) {
  const bg = { amber: 'bg-amber-50', indigo: 'bg-indigo-50', emerald: 'bg-emerald-50' }[color];
  const text = {
    amber: 'text-amber-700',
    indigo: 'text-indigo-700',
    emerald: 'text-emerald-700',
  }[color];

  return (
    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
      <div className={`${bg} rounded-md px-3 py-2 mb-2`}>
        <code className={`text-xs font-mono ${text} break-all`}>{formula}</code>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
