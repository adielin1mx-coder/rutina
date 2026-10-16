import { useSyncExternalStore } from 'react';
import type React from 'react';
import type { Day } from '@/data/rutina';

/** Tipo de día: hipertrofia (volumen) o fuerza (pesado). */
export type DayType = 'hyp' | 'str';
export const typeOf = (day: Day): DayType => (day.heavy ? 'str' : 'hyp');
export const TYPE_LABEL: Record<DayType, { long: string; tag: string }> = {
  hyp: { long: 'Hipertrofia', tag: 'HIP' },
  str: { long: 'Fuerza', tag: 'FZA' },
};

export interface Prefs {
  hyp: string;
  str: string;
  name: string;
}

export const DEFAULT_PREFS: Prefs = { hyp: '#a855f7', str: '#ff2d2d', name: 'Ian' };
export const PRESETS = ['#ff2d2d', '#ff7a1a', '#ffc21a', '#3ddc84', '#22d3ee', '#3b82f6', '#a855f7', '#f472b6'];

const KEY = 'rutina.prefs';
const HEX = /^#[0-9a-f]{6}$/i;

function read(): Prefs {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Prefs>;
    return {
      hyp: raw.hyp && HEX.test(raw.hyp) ? raw.hyp : DEFAULT_PREFS.hyp,
      str: raw.str && HEX.test(raw.str) ? raw.str : DEFAULT_PREFS.str,
      name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 24) : DEFAULT_PREFS.name,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

let prefs = read();
const listeners = new Set<() => void>();

/** Texto legible sobre un color: negro sobre colores claros, blanco sobre oscuros. */
export function inkOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.6 ? '#0a0a0b' : '#ffffff';
}

/** Aplica los colores como variables CSS; se llama antes del primer render. */
export function applyPrefs(p: Prefs = prefs) {
  const root = document.documentElement.style;
  root.setProperty('--hyp', p.hyp);
  root.setProperty('--str', p.str);
  root.setProperty('--hyp-ink', inkOn(p.hyp));
  root.setProperty('--str-ink', inkOn(p.str));
}

/** Variables CSS `--c` y `--c-ink` con el color del tipo, para usar `bg-(--c)` etc. */
export const typeVars = (t: DayType | null) =>
  (t ? { '--c': `var(--${t})`, '--c-ink': `var(--${t}-ink)` } : { '--c': 'var(--muted-foreground)', '--c-ink': 'var(--background)' }) as React.CSSProperties;

export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* sin almacenamiento: vale para esta sesión */
  }
  applyPrefs();
  listeners.forEach((l) => l());
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => prefs,
  );
}
