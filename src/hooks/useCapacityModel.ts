import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ModelState, GlobalAssumptions, RecruitingFunction } from '../types';
import { calculateMetrics } from '../lib/calculations';

// ─── Default seed data ────────────────────────────────────────────────────────

export const DEFAULT_STATE: ModelState = {
  functions: [
    { id: '1', name: 'Tech',     ftRecruiterCount: 3, contractRecruiterCount: 1, hiredPerQuarter: 6 },
    { id: '2', name: 'Business', ftRecruiterCount: 2, contractRecruiterCount: 0, hiredPerQuarter: 9 },
    { id: '3', name: 'Sales',    ftRecruiterCount: 2, contractRecruiterCount: 1, hiredPerQuarter: 10 },
  ],
  assumptions: {
    totalEmployees: 500,
    attritionRate: 15,
    openRoles: 20,
    ftProductivity: 8,
    contractProductivity: 5,
  },
};

const STORAGE_KEY = 'rcm-v1';

function loadFromStorage(): ModelState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ModelState;
  } catch {
    // ignore parse errors
  }
  return DEFAULT_STATE;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCapacityModel() {
  const [state, setState] = useState<ModelState>(loadFromStorage);

  // Persist on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full / private mode — silently ignore
    }
  }, [state]);

  // Derived metrics — recalculated synchronously on every render
  const metrics = useMemo(() => calculateMetrics(state), [state]);

  // ── Assumption updates ──────────────────────────────────────────────────────
  const updateAssumptions = useCallback((updates: Partial<GlobalAssumptions>) => {
    setState((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, ...updates },
    }));
  }, []);

  // ── Function CRUD ───────────────────────────────────────────────────────────
  const addFunction = useCallback((fn: Omit<RecruitingFunction, 'id'>) => {
    setState((prev) => ({
      ...prev,
      functions: [
        ...prev.functions,
        { ...fn, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ],
    }));
  }, []);

  const updateFunction = useCallback(
    (id: string, updates: Partial<Omit<RecruitingFunction, 'id'>>) => {
      setState((prev) => ({
        ...prev,
        functions: prev.functions.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      }));
    },
    [],
  );

  const deleteFunction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      functions: prev.functions.filter((f) => f.id !== id),
    }));
  }, []);

  // ── Scenario management ─────────────────────────────────────────────────────
  const resetToDefault = useCallback(() => setState(DEFAULT_STATE), []);

  const loadScenario = useCallback((incoming: ModelState) => setState(incoming), []);

  return {
    state,
    metrics,
    updateAssumptions,
    addFunction,
    updateFunction,
    deleteFunction,
    resetToDefault,
    loadScenario,
  };
}
