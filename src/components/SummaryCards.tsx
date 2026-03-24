import type { ModelMetrics } from '../types';

interface Props {
  metrics: ModelMetrics;
}

function fmt(n: number, decimals = 1) {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

interface CardProps {
  title: string;
  value: string;
  sub?: string;
  accent?: 'default' | 'green' | 'red' | 'indigo';
  detail?: { label: string; value: string }[];
}

function Card({ title, value, sub, accent = 'default', detail }: CardProps) {
  const borderColor = {
    default: 'border-t-gray-300',
    green:   'border-t-emerald-500',
    red:     'border-t-rose-500',
    indigo:  'border-t-indigo-500',
  }[accent];

  const valueColor = {
    default: 'text-gray-900',
    green:   'text-emerald-600',
    red:     'text-rose-600',
    indigo:  'text-indigo-600',
  }[accent];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 border-t-4 ${borderColor} p-5 flex flex-col gap-1`}>
      <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{title}</p>
      <p className={`text-3xl font-bold ${valueColor} leading-none`}>{value}</p>
      {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      {detail && (
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 border-t border-gray-100 pt-3">
          {detail.map(({ label, value: v }) => (
            <div key={label} className="flex justify-between col-span-2">
              <dt className="truncate">{label}</dt>
              <dd className="font-medium text-gray-700">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function SummaryCards({ metrics }: Props) {
  const { totals } = metrics;
  const gapAbs = Math.abs(totals.gap);
  const isSurplus = totals.gap >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        title="Total Hiring Demand"
        value={fmt(totals.totalDemand)}
        sub="hires this quarter"
        accent="indigo"
        detail={[
          { label: 'Planned hires', value: fmt(totals.plannedHires, 0) },
          { label: 'Attrition hires', value: fmt(totals.attritionHires) },
          { label: 'Open roles backfill', value: fmt(totals.openRoles, 0) },
        ]}
      />
      <Card
        title="Total Capacity"
        value={fmt(totals.totalCapacity)}
        sub="hires recruiter capacity"
        accent="default"
        detail={[
          { label: 'FT capacity', value: fmt(totals.ftCapacity, 0) },
          { label: 'Contract capacity', value: fmt(totals.contractCapacity, 0) },
        ]}
      />
      <Card
        title={isSurplus ? 'Net Surplus' : 'Net Gap'}
        value={(isSurplus ? '+' : '−') + fmt(gapAbs)}
        sub={isSurplus ? 'more capacity than demand' : 'more demand than capacity'}
        accent={isSurplus ? 'green' : 'red'}
      />
      <Card
        title="Total Recruiters"
        value={String(totals.totalFtRecruiters + totals.totalContractRecruiters)}
        sub="across all functions"
        accent="default"
        detail={[
          { label: 'Full-time', value: String(totals.totalFtRecruiters) },
          { label: 'Contract', value: String(totals.totalContractRecruiters) },
        ]}
      />
    </div>
  );
}
