import { useMemo } from 'react';
import { blockInfo, fst7For } from '@/lib/progression';
import { firstDate, useStore } from '@/lib/store';

/** Semana y bloque actuales calculados desde el primer registro. */
export function useBlock(today: Date) {
  const first = useStore((s) => firstDate(s.sessions));
  return useMemo(() => {
    const info = blockInfo(first, today);
    return { ...info, fst7: fst7For(info.block) };
  }, [first, today]);
}

export type Block = ReturnType<typeof useBlock>;

/** ¿Se puede activar FST-7 en este ejercicio esta semana? */
export const fst7Allowed = (block: Block, exerciseId: string) =>
  !block.rampUp && !block.deload && block.fst7.some((f) => f.id === exerciseId);
