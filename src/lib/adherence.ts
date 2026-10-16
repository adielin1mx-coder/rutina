import { ALL_EXERCISES } from '@/data/rutina';
import { RECS, type Rec } from '@/data/recomendaciones';
import { weekdayOf } from '@/data/schedule';
import type { Session } from './progression';
import { isoDate, mondayOf, parseIso } from './date';

/*
 * Seguimiento: qué se hizo y qué no.
 * - Recomendaciones: hecha si se registró en su día (o, si es exclusiva de las recomendaciones, en cualquier día de esa semana).
 * - Comidas: cuántas de las comidas del día se marcaron.
 */

/** Las 7 fechas de la semana (lunes a domingo) de `d`. */
export function weekDates(d: Date): string[] {
  const mon = mondayOf(d);
  return Array.from({ length: 7 }, (_, i) => isoDate(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i)));
}

/** Fecha en la que cae un día de la rutina dentro de la semana de `d`. */
export const dateOfWeekday = (d: Date, weekday: number) => weekDates(d)[(weekday + 6) % 7];

export const doneOn = (sessions: Record<string, Session>, exerciseId: string, date: string) =>
  Object.values(sessions).some((s) => s.exerciseId === exerciseId && s.date === date);

export const doneInWeek = (sessions: Record<string, Session>, exerciseId: string, d: Date) => {
  const week = new Set(weekDates(d));
  return Object.values(sessions).some((s) => s.exerciseId === exerciseId && week.has(s.date));
};

/** Ids que solo existen como recomendación (no están en la rutina base). */
const exclusive = (r: Rec) => !ALL_EXERCISES.some((e) => e.id === r.ex.id);

export type RecMark = 'done' | 'miss' | 'na';

/** Estado de una recomendación en la semana de `d`, visto desde `today`. */
export function recMark(sessions: Record<string, Session>, r: Rec, d: Date, today: Date, first: string | null): RecMark {
  const date = dateOfWeekday(d, weekdayOf(r.day));
  const done = exclusive(r) ? doneInWeek(sessions, r.ex.id, d) : doneOn(sessions, r.ex.id, date);
  if (done) return 'done';
  // Hoy y lo que viene todavía se pueden hacer: no cuentan como fallados.
  if (date >= isoDate(today) || !first || date < isoDate(mondayOf(parseIso(first)))) return 'na';
  return 'miss';
}

export interface RecStats {
  week: { done: number; offered: number };
  total: { done: number; offered: number };
  perRec: { rec: Rec; weeks: RecMark[]; pct: number | null }[];
}

/** Conteo de recomendaciones: esta semana, histórico y las últimas `span` semanas por recomendación. */
export function recStats(sessions: Record<string, Session>, today: Date, first: string | null, span = 6): RecStats {
  const thisMon = mondayOf(today);
  const firstMon = first ? mondayOf(parseIso(first)) : thisMon;
  const nWeeks = Math.max(1, Math.round((thisMon.getTime() - firstMon.getTime()) / (7 * 86_400_000)) + 1);
  const weekAt = (back: number) => new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - back * 7);

  const count = (back: number) =>
    RECS.reduce(
      (acc, r) => {
        const m = recMark(sessions, r, weekAt(back), today, first);
        if (m !== 'na') acc.offered++;
        if (m === 'done') acc.done++;
        return acc;
      },
      { done: 0, offered: 0 },
    );

  const total = { done: 0, offered: 0 };
  for (let b = 0; b < nWeeks; b++) {
    const c = count(b);
    total.done += c.done;
    total.offered += c.offered;
  }

  const perRec = RECS.map((rec) => {
    const weeks = Array.from({ length: span }, (_, i) => recMark(sessions, rec, weekAt(span - 1 - i), today, first));
    let done = 0;
    let offered = 0;
    for (let b = 0; b < nWeeks; b++) {
      const m = recMark(sessions, rec, weekAt(b), today, first);
      if (m !== 'na') offered++;
      if (m === 'done') done++;
    }
    return { rec, weeks, pct: offered ? Math.round((done / offered) * 100) : null };
  });

  return { week: count(0), total, perRec };
}

/* ---------- Comidas ---------- */

export const mealsDone = (meals: Record<string, string[]>, names: string[], date: string) =>
  (meals[date] ?? []).filter((m) => names.includes(m)).length;

export interface MealStats {
  today: number;
  goal: number;
  last7: { date: string; n: number }[];
  /** Días completos seguidos hasta hoy (si hoy aún no está completo, cuenta hasta ayer). */
  streak: number;
  weekAvg: number;
  total: number;
}

export function mealStats(meals: Record<string, string[]>, names: string[], today: Date): MealStats {
  const goal = names.length;
  const day = (back: number) => isoDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - back));
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = day(6 - i);
    return { date, n: mealsDone(meals, names, date) };
  });

  let streak = 0;
  let b = mealsDone(meals, names, day(0)) >= goal ? 0 : 1;
  while (mealsDone(meals, names, day(b)) >= goal) {
    streak++;
    b++;
  }

  const week = weekDates(today).filter((d) => d <= isoDate(today));
  const weekAvg = week.reduce((n, d) => n + mealsDone(meals, names, d), 0) / week.length;
  const total = Object.values(meals).reduce((n, list) => n + list.length, 0);

  return { today: mealsDone(meals, names, day(0)), goal, last7, streak, weekAvg, total };
}
