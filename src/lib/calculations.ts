import type { ModelState, ModelMetrics, FunctionMetrics } from '../types';

/**
 * Core business logic — pure function, no side effects.
 *
 * Formulas
 * ─────────────────────────────────────────────────────────
 *  Attrition hires     = totalEmployees × (attritionRate / 100)
 *  Total demand        = Σ plannedHires + attritionHires + openRoles
 *
 *  Per function:
 *   share              = fn.plannedHires / Σ plannedHires   (proportional)
 *   attritionShare     = attritionHires × share
 *   openRolesShare     = openRoles × share
 *   totalDemand        = plannedHires + attritionShare + openRolesShare
 *   ftCapacity         = ftRecruiterCount × ftProductivity
 *   contractCapacity   = contractRecruiterCount × contractProductivity
 *   totalCapacity      = ftCapacity + contractCapacity
 *   gap                = totalCapacity − totalDemand
 */
export function calculateMetrics(state: ModelState): ModelMetrics {
  const { functions, assumptions } = state;

  const totalPlannedHires = functions.reduce((s, f) => s + f.hiredPerQuarter, 0);
  const attritionHires = (assumptions.totalEmployees * assumptions.attritionRate) / 100;

  const functionMetrics: FunctionMetrics[] = functions.map((fn) => {
    const share =
      totalPlannedHires > 0
        ? fn.hiredPerQuarter / totalPlannedHires
        : functions.length > 0
        ? 1 / functions.length
        : 0;

    const attritionShare = attritionHires * share;
    const openRolesShare = assumptions.openRoles * share;
    const totalDemand = fn.hiredPerQuarter + attritionShare + openRolesShare;
    const ftCapacity = fn.ftRecruiterCount * assumptions.ftProductivity;
    const contractCapacity = fn.contractRecruiterCount * assumptions.contractProductivity;
    const totalCapacity = ftCapacity + contractCapacity;

    return {
      id: fn.id,
      name: fn.name,
      ftRecruiterCount: fn.ftRecruiterCount,
      contractRecruiterCount: fn.contractRecruiterCount,
      plannedHires: fn.hiredPerQuarter,
      attritionHiresShare: attritionShare,
      openRolesShare,
      totalDemand,
      ftCapacity,
      contractCapacity,
      totalCapacity,
      gap: totalCapacity - totalDemand,
    };
  });

  const totalFtCapacity = functionMetrics.reduce((s, f) => s + f.ftCapacity, 0);
  const totalContractCapacity = functionMetrics.reduce((s, f) => s + f.contractCapacity, 0);
  const totalCapacity = totalFtCapacity + totalContractCapacity;
  const totalDemand = totalPlannedHires + attritionHires + assumptions.openRoles;

  return {
    functions: functionMetrics,
    totals: {
      plannedHires: totalPlannedHires,
      attritionHires,
      openRoles: assumptions.openRoles,
      totalDemand,
      ftCapacity: totalFtCapacity,
      contractCapacity: totalContractCapacity,
      totalCapacity,
      gap: totalCapacity - totalDemand,
      totalFtRecruiters: functions.reduce((s, f) => s + f.ftRecruiterCount, 0),
      totalContractRecruiters: functions.reduce((s, f) => s + f.contractRecruiterCount, 0),
    },
  };
}
