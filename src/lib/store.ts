import { useSyncExternalStore } from 'react';
import { exerciseById } from '@/data/catalog';
import type { Session, Unit } from './progression';

/*
 * Registro de sesiones. Fuente local: localStorage (funciona sin conexión).
 * Fuente remota: Google Sheet vía Apps Script (ver apps-script/Code.gs).
 * Cada cambio se marca como pendiente y se envía en cuanto hay conexión.
 */

const K = {
  sessions: 'rutina.sessions.v1',
  pending: 'rutina.pending.v1',
  deleted: 'rutina.deleted.v1',
  sync: 'rutina.sync.v1',
  units: 'rutina.units.v1',
  fst7: 'rutina.fst7.v1',
  meals: 'rutina.meals.v1',
  mealsPending: 'rutina.meals-pending.v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento bloqueado: se sigue en memoria */
  }
}

export type SyncStatus = 'off' | 'idle' | 'syncing' | 'pending' | 'error';
export interface SyncConfig {
  url: string;
  token: string;
}

interface State {
  sessions: Record<string, Session>;
  pending: string[];
  deleted: string[];
  sync: SyncConfig | null;
  status: SyncStatus;
  error: string | null;
  lastSync: number | null;
  units: Record<string, Unit>;
  fst7: Record<string, boolean>;
  /** Comidas marcadas por fecha (YYYY-MM-DD → nombres). */
  meals: Record<string, string[]>;
  mealsPending: string[];
  /** El Apps Script desplegado es una versión anterior (hay que crear una nueva versión). */
  serverOutdated: boolean;
}

let state: State = {
  sessions: load(K.sessions, {}),
  pending: load(K.pending, []),
  deleted: load(K.deleted, []),
  sync: load<SyncConfig | null>(K.sync, null),
  status: 'off',
  error: null,
  lastSync: null,
  units: load(K.units, {}),
  fst7: load(K.fst7, {}),
  meals: load(K.meals, {}),
  mealsPending: load(K.mealsPending, []),
  serverOutdated: false,
};
const hasPending = () => state.pending.length > 0 || state.deleted.length > 0 || state.mealsPending.length > 0;
state.status = state.sync ? (hasPending() ? 'pending' : 'idle') : 'off';

const listeners = new Set<() => void>();
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  if ('sessions' in patch) save(K.sessions, state.sessions);
  if ('pending' in patch) save(K.pending, state.pending);
  if ('deleted' in patch) save(K.deleted, state.deleted);
  if ('sync' in patch) save(K.sync, state.sync);
  if ('units' in patch) save(K.units, state.units);
  if ('fst7' in patch) save(K.fst7, state.fst7);
  if ('meals' in patch) save(K.meals, state.meals);
  if ('mealsPending' in patch) save(K.mealsPending, state.mealsPending);
  listeners.forEach((l) => l());
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
  );
}

/* ---------- Consultas ---------- */

export const historyOf = (sessions: Record<string, Session>, exerciseId: string, includeFst7 = false) =>
  Object.values(sessions)
    .filter((s) => s.exerciseId === exerciseId && (includeFst7 || !s.fst7))
    .sort((a, b) => (a.date === b.date ? b.ts - a.ts : b.date.localeCompare(a.date)));

export const firstDate = (sessions: Record<string, Session>) =>
  Object.values(sessions).reduce<string | null>((min, s) => (!min || s.date < min ? s.date : min), null);

/* ---------- Mutaciones ---------- */

export function saveSession(s: Session) {
  set({
    sessions: { ...state.sessions, [s.id]: s },
    pending: [...new Set([...state.pending, s.id])],
    deleted: state.deleted.filter((id) => id !== s.id),
  });
  void flush();
}

export function deleteSession(id: string) {
  const { [id]: _removed, ...rest } = state.sessions;
  set({
    sessions: rest,
    pending: state.pending.filter((p) => p !== id),
    deleted: [...new Set([...state.deleted, id])],
  });
  void flush();
}

export const setUnit = (exerciseId: string, unit: Unit) => set({ units: { ...state.units, [exerciseId]: unit } });
export const setFst7 = (exerciseId: string, on: boolean) => set({ fst7: { ...state.fst7, [exerciseId]: on } });

/** Marca o desmarca una comida en una fecha. */
export function toggleMeal(date: string, meal: string) {
  const cur = state.meals[date] ?? [];
  const next = cur.includes(meal) ? cur.filter((m) => m !== meal) : [...cur, meal];
  set({ meals: { ...state.meals, [date]: next }, mealsPending: [...new Set([...state.mealsPending, date])] });
  void flush();
}

export function importMeals(meals: Record<string, string[]>) {
  set({ meals: { ...state.meals, ...meals }, mealsPending: [...new Set([...state.mealsPending, ...Object.keys(meals)])] });
  void flush();
}

export function setSyncConfig(cfg: SyncConfig | null) {
  set({ sync: cfg, status: cfg ? 'idle' : 'off', error: null });
  if (cfg) {
    // Al conectar por primera vez, todo lo local se marca pendiente para subirlo.
    set({
      pending: [...new Set([...state.pending, ...Object.keys(state.sessions)])],
      mealsPending: [...new Set([...state.mealsPending, ...Object.keys(state.meals)])],
    });
    void pull();
  }
}

/* ---------- Sincronización con Apps Script ---------- */

async function call(body: object) {
  const cfg = state.sync!;
  // text/plain evita el preflight CORS que Apps Script no responde.
  const res = await fetch(cfg.url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ token: cfg.token, ...body }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Error del servidor');
  return json;
}

/*
 * Cola única: subir y descargar nunca se cruzan. Así un `list` que salió antes de un
 * `upsert` no puede pisar con datos viejos lo que se acaba de guardar.
 */
let queue: Promise<void> = Promise.resolve();
const run = (task: () => Promise<void>) => (queue = queue.then(task, task));

let flushQueued: Promise<void> | null = null;

export function flush(): Promise<void> {
  if (!state.sync) return Promise.resolve();
  if (flushQueued) return flushQueued;
  flushQueued = run(async () => {
    flushQueued = null;
    await doFlush();
  });
  return flushQueued;
}

async function doFlush() {
  if (!state.sync || !hasPending()) return;
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    set({ status: 'pending' });
    return;
  }
  const ids = [...state.pending];
  const del = [...state.deleted];
  const mealDates = [...state.mealsPending];
  const sentMeals = new Map(mealDates.map((d) => [d, JSON.stringify(state.meals[d] ?? [])]));
  set({ status: 'syncing', error: null });
  try {
    const sessions = ids.map((id) => state.sessions[id]).filter(Boolean).map(withName);
    const sentTs = new Map(sessions.map((s) => [s.id, s.ts]));
    const meals = mealDates.map((date) => ({ date, done: state.meals[date] ?? [] }));
    const json = await call({ action: 'upsert', sessions, deleted: del, meals });
    // Un script viejo ignora las comidas pero responde ok: entonces siguen pendientes.
    const mealsOk = json.mealsSaved !== undefined;
    set({
      // Si una sesión se editó mientras se enviaba, sigue pendiente.
      pending: state.pending.filter((id) => !sentTs.has(id) || state.sessions[id]?.ts !== sentTs.get(id)),
      deleted: state.deleted.filter((id) => !del.includes(id)),
      mealsPending: mealsOk
        ? state.mealsPending.filter((d) => !sentMeals.has(d) || JSON.stringify(state.meals[d] ?? []) !== sentMeals.get(d))
        : state.mealsPending,
      serverOutdated: !json.version,
      lastSync: Date.now(),
    });
    set({ status: !mealsOk && mealDates.length ? 'error' : hasPending() ? 'pending' : 'idle', error: !mealsOk && mealDates.length ? OUTDATED : null });
  } catch (e) {
    set({ status: 'error', error: e instanceof Error ? e.message : String(e) });
  }
}

const OUTDATED = 'El Apps Script está desactualizado: las comidas no se guardan en la hoja.';

const withName = (s: Session) => ({ ...s, exerciseName: exerciseById(s.exerciseId)?.name ?? s.exerciseId });

/** Descarga el historial de la Sheet y lo combina con lo local (lo pendiente gana). */
export function pull(): Promise<void> {
  if (!state.sync) return Promise.resolve();
  return run(async () => {
    if (!state.sync) return;
    set({ status: 'syncing', error: null });
    try {
      const json = await call({ action: 'list' });
      const remote: Session[] = json.sessions ?? [];
      const merged: Record<string, Session> = {};
      for (const s of remote) if (!state.deleted.includes(s.id)) merged[s.id] = s;
      for (const id of state.pending) if (state.sessions[id]) merged[id] = state.sessions[id];

      let meals = state.meals;
      let mealsPending = state.mealsPending;
      if (json.meals) {
        const remoteMeals: Record<string, string[]> = json.meals;
        meals = { ...remoteMeals };
        const missing: string[] = [];
        for (const [d, list] of Object.entries(state.meals)) {
          if (state.mealsPending.includes(d)) meals[d] = list;
          else if (!(d in remoteMeals) && list.length) {
            // La hoja nunca lo recibió (p. ej. con un script viejo): se conserva y se vuelve a subir.
            meals[d] = list;
            missing.push(d);
          }
        }
        mealsPending = [...new Set([...state.mealsPending, ...missing])];
      }
      set({ sessions: merged, meals, mealsPending, serverOutdated: !json.version || !json.meals, lastSync: Date.now(), status: 'idle' });
      void flush();
    } catch (e) {
      set({ status: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  });
}

/** Primera descarga al abrir la app (se llama cuando termina la bienvenida para no trabar la animación). */
let started = false;
export function startSync() {
  if (started) return;
  started = true;
  if (state.sync) void pull();
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void flush());
}
