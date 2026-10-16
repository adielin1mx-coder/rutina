import { ALL_EXERCISES, type Exercise } from './rutina';
import { RECS } from './recomendaciones';

/** Todos los ejercicios registrables: la rutina más las recomendaciones (sin duplicar ids). */
export const CATALOG: Exercise[] = [...ALL_EXERCISES, ...RECS.map((r) => r.ex).filter((e) => !ALL_EXERCISES.some((x) => x.id === e.id))];

export const exerciseById = (id: string) => CATALOG.find((e) => e.id === id);
