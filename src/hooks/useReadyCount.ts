import { useMemo } from 'react';
import { CATALOG } from '@/data/catalog';
import type { Block } from '@/hooks/useBlock';
import { advise } from '@/lib/progression';
import { historyOf, useStore } from '@/lib/store';

/** Ejercicios cuya doble progresión ya pide subir peso. */
export function useReadyCount(block?: Block) {
  const sessions = useStore((s) => s.sessions);
  return useMemo(() => CATALOG.filter((e) => advise(e, historyOf(sessions, e.id), block).verdict === 'up').length, [sessions, block]);
}
