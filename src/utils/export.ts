import type { ModelState, ModelMetrics } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJSON(state: ModelState, metrics: ModelMetrics) {
  const payload = {
    exportedAt: new Date().toISOString(),
    assumptions: state.assumptions,
    functions: state.functions,
    metrics,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `recruiting-capacity-${timestamp()}.json`);
}

export function exportToCSV(metrics: ModelMetrics) {
  const headers = [
    'Function',
    'FT Recruiters',
    'Contract Recruiters',
    'Planned Hires',
    'Attrition Share',
    'Open Roles Share',
    'Total Demand',
    'FT Capacity',
    'Contract Capacity',
    'Total Capacity',
    'Gap / Surplus',
    'Status',
  ];

  const dataRows = metrics.functions.map((f) => [
    f.name,
    f.ftRecruiterCount,
    f.contractRecruiterCount,
    round(f.plannedHires),
    round(f.attritionHiresShare),
    round(f.openRolesShare),
    round(f.totalDemand),
    round(f.ftCapacity),
    round(f.contractCapacity),
    round(f.totalCapacity),
    round(f.gap),
    f.gap >= 0 ? 'Surplus' : 'Gap',
  ]);

  const t = metrics.totals;
  const totalsRow = [
    'TOTAL',
    t.totalFtRecruiters,
    t.totalContractRecruiters,
    round(t.plannedHires),
    round(t.attritionHires),
    round(t.openRoles),
    round(t.totalDemand),
    round(t.ftCapacity),
    round(t.contractCapacity),
    round(t.totalCapacity),
    round(t.gap),
    t.gap >= 0 ? 'Surplus' : 'Gap',
  ];

  const csv = [headers, ...dataRows, totalsRow]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `recruiting-capacity-${timestamp()}.csv`);
}

const round = (n: number) => Math.round(n * 10) / 10;
const timestamp = () => new Date().toISOString().slice(0, 10);
