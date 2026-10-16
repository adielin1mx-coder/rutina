import { useEffect, useRef, useState } from 'react';
import { Timer, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const label = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s}s`);

/** Temporizador de descanso opcional. Vibra al terminar (si el teléfono lo permite). */
export function RestTimer({ presets }: { presets: number[] }) {
  const [total, setTotal] = useState(0);
  const [left, setLeft] = useState(0);
  const [run, setRun] = useState(0);
  const end = useRef(0);

  useEffect(() => {
    if (!total) return;
    const id = window.setInterval(() => {
      const s = Math.max(0, Math.ceil((end.current - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) {
        clearInterval(id);
        try {
          navigator.vibrate?.([200, 100, 200]);
        } catch {
          /* sin vibración */
        }
      }
    }, 250);
    return () => clearInterval(id);
  }, [total, run]);

  const start = (s: number) => {
    end.current = Date.now() + s * 1000;
    setLeft(s);
    setTotal(s);
    setRun((r) => r + 1);
  };
  const running = total > 0 && left > 0;
  const pct = total ? left / total : 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-surface p-2.5">
      <div className="relative grid size-11 shrink-0 place-items-center">
        <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
          <circle cx="22" cy="22" r="19" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="22" cy="22" r="19" fill="none" stroke="var(--neon)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 19}
            strokeDashoffset={2 * Math.PI * 19 * (1 - pct)}
            className="transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        {running ? <span className="tabular text-[11px] font-bold">{label(left)}</span> : <Timer className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex flex-1 flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[13px] text-muted-foreground">{total > 0 && left === 0 ? '¡A la siguiente serie!' : 'Descanso'}</span>
        {presets.map((s) => (
          <button
            key={s}
            onClick={() => start(s)}
            className={cn('h-8 rounded-full border px-3 text-[13px] font-semibold tabular', running && total === s ? 'border-neon text-neon' : 'bg-surface-2')}
          >
            {label(s)}
          </button>
        ))}
        {running && (
          <button onClick={() => setTotal(0)} aria-label="Detener" className="rounded-full p-1.5 text-muted-foreground">
            <X className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
