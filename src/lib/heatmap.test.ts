import { describe, expect, it } from 'vitest';
import { DAYS } from '@/data/rutina';
import { average, loggedByDate, monthGrid, trainingCell, weekOf } from './heatmap';
import { weightTrend, type Session } from './progression';

const ses = (exerciseId: string, date: string, w = 10, unit: 'kg' | 'lb' = 'kg'): Session => ({
  id: `${exerciseId}-${date}`,
  date,
  exerciseId,
  unit,
  fst7: false,
  sets: [{ w, reps: 12 }],
  ts: 1,
});
const byId = (list: Session[]) => Object.fromEntries(list.map((s) => [s.id, s]));

// Lunes 12 de octubre de 2026 = Empuje.
const empuje = DAYS.empuje.exercises;
const today = '2026-10-18';

describe('trainingCell', () => {
  it('porcentaje de la rutina del día registrada', () => {
    const logged = loggedByDate(byId([ses(empuje[0].id, '2026-10-12'), ses(empuje[1].id, '2026-10-12'), ses('rec-x', '2026-10-12')]));
    const c = trainingCell(logged, '2026-10-12', today, '2026-10-01');
    expect(c.done).toBe(2);
    expect(c.total).toBe(empuje.length);
    expect(c.pct).toBeCloseTo(2 / empuje.length);
  });

  it('día de entrenamiento sin registros cuenta como 0', () => {
    expect(trainingCell(new Map(), '2026-10-13', today, '2026-10-01').pct).toBe(0);
  });

  it('futuro, antes de empezar y descanso vacío no cuentan', () => {
    expect(trainingCell(new Map(), '2026-10-19', today, '2026-10-01').pct).toBeNull();
    expect(trainingCell(new Map(), '2026-09-28', today, '2026-10-01').pct).toBeNull();
    expect(trainingCell(new Map(), '2026-10-17', today, '2026-10-01').pct).toBeNull();
  });

  it('descanso con algo registrado cuenta completo', () => {
    const logged = loggedByDate(byId([ses(empuje[0].id, '2026-10-17')]));
    expect(trainingCell(logged, '2026-10-17', today, '2026-10-01').pct).toBe(1);
  });
});

describe('calendario', () => {
  it('semana de lunes a domingo y semanas anteriores', () => {
    expect(weekOf(new Date(2026, 9, 16))[0]).toBe('2026-10-12');
    expect(weekOf(new Date(2026, 9, 16), 1)[6]).toBe('2026-10-11');
  });

  it('octubre 2026 empieza en jueves', () => {
    const g = monthGrid(2026, 9);
    expect(g[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(g.flat().filter(Boolean)).toHaveLength(31);
    expect(g.every((r) => r.length === 7)).toBe(true);
  });

  it('promedio ignora nulos', () => {
    expect(average([1, null, 0.5])).toBe(0.75);
    expect(average([null])).toBeNull();
  });
});

describe('weightTrend', () => {
  it('peso actual y cambio desde el inicio en la misma unidad', () => {
    const h = [ses('a', '2026-10-15', 85), ses('a', '2026-10-08', 82.5), ses('a', '2026-10-01', 80), ses('a', '2026-09-20', 150, 'lb')];
    const t = weightTrend(h)!;
    expect(t.current).toBe(85);
    expect(t.delta).toBe(5);
    expect(t.prevDelta).toBe(2.5);
    expect(t.sessions).toBe(3);
    expect(t.points).toEqual([80, 82.5, 85]);
  });

  it('sin historial no hay tendencia', () => {
    expect(weightTrend([])).toBeNull();
  });
});
