import { dayFor } from '@/data/schedule';
import type { Day } from '@/data/rutina';
import type { Session } from './progression';
import { isoDate, mondayOf, parseIso } from './date';

/*
 * Mapa de calor: qué porcentaje de la rutina de cada día se registró.
 * Solo cuentan los ejercicios base del día (las recomendaciones son extra).
 */

/** Ejercicios registrados por fecha. */
export function loggedByDate(sessions: Record<string, Session>): Map<string, Set<string>> {
  const out = new Map<string, Set<string>>();
  for (const s of Object.values(sessions)) {
    if (!out.has(s.date)) out.set(s.date, new Set());
    out.get(s.date)!.add(s.exerciseId);
  }
  return out;
}

export interface TrainingCell {
  date: string;
  day: Day | null;
  done: number;
  total: number;
  /** 0–1, o null si no aplica (futuro, descanso sin registros o antes de empezar). */
  pct: number | null;
}

export function trainingCell(logged: Map<string, Set<string>>, date: string, today: string, first: string | null): TrainingCell {
  const day = dayFor(parseIso(date).getDay());
  const set = logged.get(date) ?? new Set<string>();
  if (!day) return { date, day, done: set.size, total: 0, pct: set.size ? 1 : null };
  const done = day.exercises.filter((e) => set.has(e.id)).length;
  const total = day.exercises.length;
  const pending = date > today || (date === today && done === 0) || !first || date < first;
  return { date, day, done, total, pct: pending && done === 0 ? null : done / total };
}

/** Promedio de los días con valor (null se ignora). */
export const average = (values: (number | null)[]) => {
  const v = values.filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

/** Fechas de lunes a domingo de la semana que está `offset` semanas antes de `d`. */
export function weekOf(d: Date, offset = 0): string[] {
  const mon = mondayOf(d);
  return Array.from({ length: 7 }, (_, i) => isoDate(new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - offset * 7 + i)));
}

/** Calendario del mes (filas lunes–domingo). Los días fuera del mes van como null. */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => isoDate(new Date(year, month, i + 1)))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
}
