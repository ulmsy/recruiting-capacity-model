// ─── Domain model ────────────────────────────────────────────────────────────

export interface RecruitingFunction {
  id: string;
  name: string;
  ftRecruiterCount: number;
  contractRecruiterCount: number;
  hiredPerQuarter: number; // planned hires per quarter
}

export interface GlobalAssumptions {
  totalEmployees: number;
  attritionRate: number;   // percentage, e.g. 15 = 15 %
  openRoles: number;
  ftProductivity: number;       // hires per FT recruiter per quarter
  contractProductivity: number; // hires per contract recruiter per quarter
}

export interface ModelState {
  functions: RecruitingFunction[];
  assumptions: GlobalAssumptions;
}

// ─── Calculated outputs ───────────────────────────────────────────────────────

export interface FunctionMetrics {
  id: string;
  name: string;
  ftRecruiterCount: number;
  contractRecruiterCount: number;
  plannedHires: number;
  attritionHiresShare: number;
  openRolesShare: number;
  totalDemand: number;
  ftCapacity: number;
  contractCapacity: number;
  totalCapacity: number;
  gap: number; // positive = surplus, negative = gap
}

export interface Totals {
  plannedHires: number;
  attritionHires: number;
  openRoles: number;
  totalDemand: number;
  ftCapacity: number;
  contractCapacity: number;
  totalCapacity: number;
  gap: number;
  totalFtRecruiters: number;
  totalContractRecruiters: number;
}

export interface ModelMetrics {
  functions: FunctionMetrics[];
  totals: Totals;
}
