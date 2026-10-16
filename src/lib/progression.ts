import type { Equip, Exercise } from '@/data/rutina';
import { daysBetween, mondayOf, parseIso } from './date';

export type Unit = 'kg' | 'lb';

export interface SetEntry {
  w: number;
  reps: number;
  rir?: number;
}

export interface Session {
  id: string;
  date: string; // YYYY-MM-DD
  exerciseId: string;
  unit: Unit;
  fst7: boolean;
  sets: SetEntry[];
  ts: number;
}

/* ---------- Bloques: arranque, descarga y FST-7 ---------- */

/** Ciclo de 6 semanas: 5 de trabajo + 1 de descarga (regla “Descarga”: cada 5–6 semanas). */
export const BLOCK_WEEKS = 6;

export interface BlockInfo {
  started: boolean;
  week: number; // semana absoluta desde el primer registro (1…)
  block: number; // bloque (1…)
  weekInBlock: number; // 1…6
  rampUp: boolean; // semanas 1–2: arranque
  deload: boolean; // semana 6 de cada bloque
}

export function blockInfo(firstDate: string | null, today: Date): BlockInfo {
  if (!firstDate) return { started: false, week: 0, block: 1, weekInBlock: 0, rampUp: true, deload: false };
  const start = mondayOf(parseIso(firstDate));
  const week = Math.max(1, Math.floor(daysBetween(start, mondayOf(today)) / 7) + 1);
  const block = Math.ceil(week / BLOCK_WEEKS);
  const weekInBlock = ((week - 1) % BLOCK_WEEKS) + 1;
  return { started: true, week, block, weekInBlock, rampUp: week <= 2, deload: weekInBlock === BLOCK_WEEKS };
}

/**
 * FST-7 recomendado por bloque. Siempre aislamientos que atacan los puntos rezagados
 * (hombro frontal y posterior); nunca compuestos ni hiperextensiones.
 */
export const FST7_PLAN: Record<'odd' | 'even', { id: string; why: string }[]> = {
  odd: [
    { id: 'elevacion-frontal-polea', why: 'Hombro frontal: aislamiento en polea, tensión constante y fácil de ajustar en descansos cortos.' },
    { id: 'pec-deck-invertido', why: 'Hombro posterior: máquina estable, sin fatiga lumbar; ideal para 7 series con 30–45 s.' },
  ],
  even: [
    { id: 'elevacion-frontal-polea', why: 'Hombro frontal: sigue si en tus fotos todavía va atrasado; si no, déjalo descansar este bloque.' },
    { id: 'pajaros-face-pull', why: 'Hombro posterior: rota el estímulo al día de Jalón para no estancarte con la misma máquina.' },
  ],
};

export const fst7For = (block: number) => FST7_PLAN[block % 2 === 1 ? 'odd' : 'even'];

export const FST7_SETS = 7;
export const FST7_REPS: [number, number] = [10, 12];

/* ---------- Doble progresión ---------- */

/** Incremento real del equipo (mancuernas: por mancuerna). */
export function increment(equip: Equip, unit: Unit): number {
  if (unit === 'lb') return 5;
  return equip === 'dumbbell' ? 2 : 2.5;
}

const roundTo = (x: number, step: number) => Math.round(x / step) * step;
const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1));

export const workingWeight = (s: Session) => Math.max(...s.sets.map((x) => x.w));
export const e1rm = (w: number, reps: number) => w * (1 + reps / 30); // Epley
export const bestE1rm = (s: Session) => Math.max(...s.sets.map((x) => e1rm(x.w, x.reps)));

export type Verdict = 'first' | 'up' | 'hold' | 'down' | 'deload';

export interface Advice {
  verdict: Verdict;
  title: string;
  detail: string;
  /** Peso sugerido para la siguiente sesión. */
  next?: number;
  unit?: Unit;
}

/**
 * Recomendación para la próxima sesión según la regla “Doble progresión”
 * (todas las series en el tope del rango → +2.5–5% y volver al mínimo),
 * que es como Nippard plantea la progresión: reps dentro del rango a un RIR
 * objetivo y, al llegar al tope, carga.
 *
 * `history` va de la sesión más reciente a la más antigua y no incluye FST-7.
 */
export function advise(ex: Exercise, history: Session[], block?: BlockInfo): Advice {
  if (block?.deload) {
    const last = history[0];
    const w = last ? roundTo(workingWeight(last) * 0.9, increment(ex.equip, last.unit)) : undefined;
    return {
      verdict: 'deload',
      title: 'Semana de descarga',
      detail: `La mitad de las series (${Math.ceil(ex.sets / 2)}), RIR 3–4 y sin técnicas.${w ? ` Usa ~${fmt(w)} ${last!.unit}.` : ''}`,
      next: w,
      unit: last?.unit,
    };
  }

  const [min, max] = ex.reps;
  const last = history[0];
  if (!last || last.sets.length === 0) {
    return {
      verdict: 'first',
      title: 'Primera sesión',
      detail: `Elige un peso con el que llegues a ${min}–${max} reps ${ex.rir === null ? 'cerca del fallo' : `con RIR ${ex.rir}–${ex.rir + 1}`}. Anótalo y desde ahí progresamos.`,
    };
  }

  const unit = last.unit;
  const w = workingWeight(last);
  const inc = increment(ex.equip, unit);
  const working = last.sets.filter((s) => s.w === w);
  const rirOk = (s: SetEntry) => s.rir === undefined || ex.rir === null || s.rir >= ex.rir;
  const allTop = working.length >= Math.min(ex.sets, last.sets.length) && working.every((s) => s.reps >= max && rirOk(s));

  if (allTop) {
    const pct = ex.kind === 'heavy' || (ex.kind === 'compound' && ex.equip !== 'dumbbell') ? 0.05 : 0.025;
    const next = w + Math.max(inc, roundTo(w * pct, inc));
    const jump = (next - w) / w;
    if (jump > 0.1) {
      return {
        verdict: 'hold',
        title: `Casi: alarga el rango antes de subir`,
        detail: `El siguiente salto (+${fmt(next - w)} ${unit}) es del ${Math.round(jump * 100)}%. Llega a ${max + 2} reps en todas las series con ${fmt(w)} ${unit} y entonces sube a ${fmt(next)} ${unit}, volviendo a ${min} reps.`,
        next: w,
        unit,
      };
    }
    return {
      verdict: 'up',
      title: `Sube a ${fmt(next)} ${unit}`,
      detail: `Completaste todas las series en el tope (${max} reps). Sube ${Math.round(pct * 1000) / 10}% y vuelve a ${min} reps.`,
      next,
      unit,
    };
  }

  const below = (s: Session) => s.sets.some((x) => x.reps < min);
  if (below(last) && history[1] && below(history[1]) && workingWeight(history[1]) <= w) {
    const next = Math.max(inc, roundTo(w * 0.925, inc));
    return {
      verdict: 'down',
      title: `Baja a ${fmt(next)} ${unit}`,
      detail: `Dos sesiones seguidas por debajo de ${min} reps. Baja 5–10% y revisa la regla “Si algo falla” (técnicas primero, luego series).`,
      next,
      unit,
    };
  }

  const lowest = last.sets.reduce((a, s, i) => (s.reps < last.sets[a].reps ? i : a), 0);
  return {
    verdict: 'hold',
    title: `Mantén ${fmt(w)} ${unit}`,
    detail: `Busca +1 rep, empezando por la serie ${lowest + 1} (${last.sets[lowest].reps} reps). Cuando todas lleguen a ${max}, sube.`,
    next: w,
    unit,
  };
}

export { fmt as fmtWeight };
