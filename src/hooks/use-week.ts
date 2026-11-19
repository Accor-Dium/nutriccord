import { useMemo } from 'react';

import { summarizeDay, type DaySummary } from '@/hooks/use-day-summary';
import { lastNDays, todayISO } from '@/lib/dates';
import { useAppState, type AppState } from '@/store/app-store';

export interface WeekDay extends DaySummary {
  net: number;
  hasData: boolean;
  isToday: boolean;
}

/** Resumen de los últimos `n` días terminando hoy. */
export function summarizeWeek(state: AppState, today: string, n = 7) {
  const days: WeekDay[] = lastNDays(today, n).map((date) => {
    const s = summarizeDay(state, date);
    return {
      ...s,
      net: s.eaten - s.burned,
      hasData: s.entries.length > 0 || s.activities.length > 0,
      isToday: date === today,
    };
  });
  // Balance promedio vs. meta solo de días completos (con registros y que no sean hoy).
  const complete = days.filter((d) => d.hasData && !d.isToday);
  const avgBalance = complete.length
    ? complete.reduce((t, d) => t + (d.net - d.goalKcal), 0) / complete.length
    : null;
  const totalBurned = days.reduce((t, d) => t + d.burned, 0);
  const activeDays = days.filter((d) => d.activities.length > 0).length;
  return { days, avgBalance, totalBurned, activeDays, completeDays: complete.length };
}

export function useWeek(n = 7) {
  const state = useAppState();
  const today = todayISO();
  return useMemo(() => summarizeWeek(state, today, n), [state, today, n]);
}
