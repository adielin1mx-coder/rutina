import { useEffect, useState } from 'react';
import { WEEK } from '@/data/schedule';

/**
 * Fecha de hoy que se actualiza sola a medianoche y al volver a la pestaña.
 * `?dia=lunes` en la URL simula otro día (útil para revisar la app).
 */
function now() {
  const d = new Date();
  const forced = new URLSearchParams(window.location.search).get('dia');
  const idx = forced ? WEEK.findIndex((w) => w.slug === forced.toLowerCase()) : -1;
  if (idx >= 0) d.setDate(d.getDate() + ((idx - d.getDay() + 7) % 7));
  return d;
}

export function useToday() {
  const [today, setToday] = useState(now);

  useEffect(() => {
    const refresh = () => setToday((prev) => {
      const n = now();
      return n.toDateString() === prev.toDateString() ? prev : n;
    });
    const msToMidnight = () => {
      const t = new Date();
      return new Date(t.getFullYear(), t.getMonth(), t.getDate() + 1).getTime() - t.getTime() + 500;
    };
    let timer = window.setTimeout(function tick() {
      refresh();
      timer = window.setTimeout(tick, msToMidnight());
    }, msToMidnight());
    const onVis = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return today;
}
