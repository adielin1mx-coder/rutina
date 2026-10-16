import { describe, expect, it } from 'vitest';
import { mealStats, recStats, weekDates } from './adherence';
import type { Session } from './progression';

const ses = (exerciseId: string, date: string): Session => ({
  id: `${exerciseId}-${date}`,
  date,
  exerciseId,
  unit: 'kg',
  fst7: false,
  sets: [{ w: 10, reps: 12 }],
  ts: 1,
});
const byId = (list: Session[]) => Object.fromEntries(list.map((s) => [s.id, s]));

// Viernes 16 de octubre de 2026; la semana empieza el lunes 12.
const friday = new Date(2026, 9, 16);

describe('weekDates', () => {
  it('va de lunes a domingo', () => {
    expect(weekDates(friday)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  });
});

describe('recStats', () => {
  it('cuenta hechas y ofrecidas esta semana', () => {
    const sessions = byId([
      ses('press-banca', '2026-10-12'), // primer registro
      ses('rec-rueda-abdominal', '2026-10-12'),
      ses('rec-laterales-polea', '2026-10-15'), // exclusiva: vale cualquier día de la semana
    ]);
    const s = recStats(sessions, friday, '2026-10-12');
    // L, M y X×2 ya pasaron; las 2 del viernes (hoy) aún no cuentan porque no se han hecho.
    expect(s.week).toEqual({ done: 2, offered: 4 });
    expect(s.perRec.find((r) => r.rec.ex.id === 'rec-rueda-abdominal')!.pct).toBe(100);
  });

  it('los talones del miércoles solo cuentan si se registran el miércoles', () => {
    const jueves = recStats(byId([ses('talones-prensa', '2026-10-15')]), friday, '2026-10-12');
    const miercoles = recStats(byId([ses('talones-prensa', '2026-10-14')]), friday, '2026-10-12');
    expect(jueves.week.done).toBe(0);
    expect(miercoles.week.done).toBe(1);
  });

  it('hoy cuenta solo si ya se hizo', () => {
    const s = recStats(byId([ses('rec-pallof', '2026-10-16')]), friday, '2026-10-12');
    expect(s.week).toEqual({ done: 1, offered: 5 });
  });

  it('no cuenta días futuros ni semanas antes del primer registro', () => {
    const tuesday = new Date(2026, 9, 13);
    const s = recStats({}, tuesday, '2026-10-12');
    expect(s.week.offered).toBe(1); // solo el lunes; el martes es hoy
    expect(s.perRec[0].weeks.slice(0, 5)).toEqual(['na', 'na', 'na', 'na', 'na']);
  });
});

describe('mealStats', () => {
  const names = ['Desayuno', 'Comida', 'Cena'];
  it('racha, conteo de hoy y promedio semanal', () => {
    const meals = {
      '2026-10-13': ['Desayuno', 'Comida', 'Cena'],
      '2026-10-14': ['Desayuno', 'Comida', 'Cena'],
      '2026-10-15': ['Desayuno', 'Comida', 'Cena', 'Borrada'],
      '2026-10-16': ['Desayuno'],
    };
    const s = mealStats(meals, names, friday);
    expect(s.today).toBe(1);
    expect(s.streak).toBe(3); // martes a jueves (hoy aún no está completo)
    expect(s.weekAvg).toBeCloseTo((0 + 3 + 3 + 3 + 1) / 5);
    expect(s.last7.at(-1)).toEqual({ date: '2026-10-16', n: 1 });
  });
});
