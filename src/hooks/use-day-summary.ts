import { useMemo } from 'react';

import { FOODS_BY_ID } from '@/data/foods';
import {
  calculateDailyGoal,
  macroGoals,
  remainingKcal,
  sumActivityKcal,
  sumEntries,
} from '@/lib/calories';
import { equivalentGoals, equivalentsConsumed } from '@/lib/equivalents';
import { useAppState, type AppState } from '@/store/app-store';

/** Resumen calculado de un día: meta, consumo, ejercicio, macros y equivalentes. */
export function summarizeDay(state: AppState, date: string) {
  const goalKcal = calculateDailyGoal(state.profile);
  const entries = state.entries.filter((e) => e.date === date);
  const activities = state.activities.filter((a) => a.date === date);
  const totals = sumEntries(entries, FOODS_BY_ID);
  const burned = sumActivityKcal(activities);
  return {
    date,
    goalKcal,
    entries,
    activities,
    eaten: totals.kcal,
    macros: totals.macros,
    macroGoals: macroGoals(goalKcal),
    burned,
    activeMinutes: activities.reduce((t, a) => t + a.minutes, 0),
    remaining: remainingKcal(goalKcal, totals.kcal, burned),
    equivalents: equivalentsConsumed(entries, FOODS_BY_ID),
    equivalentGoals: equivalentGoals(goalKcal),
  };
}

export type DaySummary = ReturnType<typeof summarizeDay>;

export function useDaySummary(date: string): DaySummary {
  const state = useAppState();
  return useMemo(() => summarizeDay(state, date), [state, date]);
}
