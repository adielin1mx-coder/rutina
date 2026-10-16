import { describe, expect, it } from 'vitest';
import { exerciseById } from '@/data/rutina';
import { advise, blockInfo, type Session } from './progression';

const s = (date: string, exerciseId: string, sets: [number, number, number?][], unit: 'kg' | 'lb' = 'kg'): Session => ({
  id: date, date, exerciseId, unit, fst7: false, ts: 0,
  sets: sets.map(([w, reps, rir]) => ({ w, reps, ...(rir !== undefined ? { rir } : {}) })),
});

const banca = exerciseById('press-banca')!; // 4 × 5–7, RIR 1, heavy, barbell
const lateral = exerciseById('laterales-mancuerna')!; // 3 × 12–20, dumbbell

describe('advise', () => {
  it('primera sesión sin historial', () => {
    expect(advise(banca, []).verdict).toBe('first');
  });

  it('todas al tope → sube 5% redondeado a 2.5 kg', () => {
    const a = advise(banca, [s('2026-10-19', 'press-banca', [[80, 7], [80, 7], [80, 7], [80, 7]])]);
    expect(a.verdict).toBe('up');
    expect(a.next).toBe(85); // 80 * 1.05 = 84 → redondeo a 2.5 = 85
  });

  it('tope pero con RIR menor al objetivo → mantener', () => {
    const a = advise(banca, [s('2026-10-19', 'press-banca', [[80, 7, 0], [80, 7, 0], [80, 7, 0], [80, 7, 0]])]);
    expect(a.verdict).toBe('hold');
  });

  it('dentro del rango → mantener y buscar +1 rep en la serie más baja', () => {
    const a = advise(banca, [s('2026-10-19', 'press-banca', [[80, 7], [80, 6], [80, 5], [80, 6]])]);
    expect(a.verdict).toBe('hold');
    expect(a.detail).toContain('serie 3');
  });

  it('por debajo del mínimo 2 sesiones seguidas → bajar', () => {
    const a = advise(banca, [
      s('2026-10-26', 'press-banca', [[85, 4], [85, 4], [85, 3], [85, 3]]),
      s('2026-10-19', 'press-banca', [[85, 5], [85, 4], [85, 4], [85, 3]]),
    ]);
    expect(a.verdict).toBe('down');
    expect(a.next).toBe(77.5);
  });

  it('salto mínimo >10% en mancuernas ligeras → alargar el rango', () => {
    const a = advise(lateral, [s('2026-10-19', 'laterales-mancuerna', [[8, 20], [8, 20], [8, 20]])]);
    expect(a.verdict).toBe('hold');
    expect(a.title).toMatch(/alarga/i);
  });

  it('libras usan incrementos de 5 lb', () => {
    const a = advise(banca, [s('2026-10-19', 'press-banca', [[185, 7], [185, 7], [185, 7], [185, 7]], 'lb')]);
    expect(a.next).toBe(195);
  });
});

describe('blockInfo', () => {
  it('semanas, arranque y descarga', () => {
    const first = '2026-10-19'; // lunes
    expect(blockInfo(first, new Date(2026, 9, 22))).toMatchObject({ week: 1, rampUp: true, deload: false });
    expect(blockInfo(first, new Date(2026, 10, 2))).toMatchObject({ week: 3, rampUp: false });
    expect(blockInfo(first, new Date(2026, 10, 23))).toMatchObject({ week: 6, deload: true, block: 1 });
    expect(blockInfo(first, new Date(2026, 10, 30))).toMatchObject({ week: 7, block: 2, weekInBlock: 1 });
  });
});
