import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isoDate, parseIso } from '@/lib/date';
import { average, monthGrid, weekOf } from '@/lib/heatmap';
import { cn } from '@/lib/utils';

export interface HeatCell {
  /** 0–1; null = no aplica (futuro, descanso, antes de empezar). */
  value: number | null;
  /** Variables `--c`/`--c-ink` con el color del día. */
  vars?: React.CSSProperties;
  /** Texto corto al tocar el día, p. ej. "Empuje · 4/6 ejercicios". */
  hint: string;
  /** Borde punteado (descanso). */
  rest?: boolean;
}

type Mode = 'semana' | 'mes';
const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function readMode(key: string): Mode {
  try {
    return localStorage.getItem(key) === 'mes' ? 'mes' : 'semana';
  } catch {
    return 'semana';
  }
}

/** Fondo según el valor: más color y más brillo cuanto más completo. */
function fill(v: number | null): React.CSSProperties {
  if (v === null || v === 0) return {};
  return {
    background: `color-mix(in oklab, var(--c) ${Math.round(18 + 82 * v)}%, var(--surface-2))`,
    color: v >= 0.6 ? 'var(--c-ink)' : undefined,
    boxShadow: v >= 1 ? '0 0 16px -5px var(--c)' : undefined,
  };
}

/**
 * Mapa de calor por semana o por mes. La intensidad del color de cada día indica qué tanto se completó.
 * `cell(date)` da el valor de cada fecha; `onSelect` permite usar el día tocado (p. ej. para editarlo).
 */
export function Heatmap({
  title,
  today,
  cell,
  selected: selectedProp,
  onSelect,
  legendVars,
  storageKey,
}: {
  title: string;
  today: Date;
  cell: (date: string) => HeatCell;
  selected?: string;
  onSelect?: (date: string) => void;
  legendVars?: React.CSSProperties;
  storageKey: string;
}) {
  const [mode, setModeState] = useState<Mode>(() => readMode(storageKey));
  const [offset, setOffset] = useState(0);
  const [own, setOwn] = useState(() => isoDate(today));
  const selected = selectedProp ?? own;
  const todayIso = isoDate(today);

  const setMode = (m: Mode) => {
    setModeState(m);
    setOffset(0);
    try {
      localStorage.setItem(storageKey, m);
    } catch {
      /* sin almacenamiento */
    }
  };
  const pick = (d: string) => {
    setOwn(d);
    onSelect?.(d);
    navigator.vibrate?.(5);
  };

  const monthRef = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  const week = weekOf(today, offset);
  const grid = mode === 'mes' ? monthGrid(monthRef.getFullYear(), monthRef.getMonth()) : [week];
  const dates = grid.flat().filter((d): d is string => !!d);
  const avg = average(dates.map((d) => cell(d).value));

  const label =
    mode === 'mes'
      ? monthRef.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
      : offset === 0
        ? 'Esta semana'
        : `${parseIso(week[0]).getDate()} – ${parseIso(week[6]).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;

  const sel = dates.includes(selected) ? selected : null;
  const selCell = sel ? cell(sel) : null;

  return (
    <section className="grain rounded-2xl border bg-surface p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-2xl font-black uppercase">{title}</h2>
        <div className="inline-flex rounded-full border bg-surface-2 p-1">
          {(['semana', 'mes'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn('relative rounded-full px-3.5 py-1 text-[13px] font-semibold capitalize transition-colors', mode === m ? 'text-background' : 'text-muted-foreground')}
            >
              {mode === m && <motion.span layoutId={`hm-${storageKey}`} className="absolute inset-0 rounded-full bg-foreground" />}
              <span className="relative">{m}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button onClick={() => setOffset((o) => o + 1)} aria-label="Anterior" className="grid size-9 place-items-center rounded-full border hover:bg-surface-2">
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-center">
          <span className="block text-[15px] font-semibold first-letter:uppercase">{label}</span>
          <span className="tabular text-[12.5px] text-muted-foreground">{avg === null ? 'Sin datos' : `Promedio ${Math.round(avg * 100)}%`}</span>
        </p>
        <button
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Siguiente"
          className="grid size-9 place-items-center rounded-full border hover:bg-surface-2 disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {mode === 'mes' && DOW.map((d) => <span key={d} className="text-center text-[11px] font-bold text-muted-foreground">{d}</span>)}
        {grid.flat().map((d, i) => {
          if (!d) return <span key={`x${i}`} />;
          const c = cell(d);
          const isSel = d === sel;
          const isToday = d === todayIso;
          const pct = c.value === null ? null : Math.round(c.value * 100);
          return (
            <button
              key={d}
              onClick={() => pick(d)}
              aria-pressed={isSel}
              aria-label={`${parseIso(d).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}: ${c.hint}`}
              style={{ ...c.vars, ...fill(c.value) }}
              className={cn(
                'relative flex min-w-0 flex-col items-center justify-center rounded-lg border transition-[background,box-shadow] duration-300',
                mode === 'mes' ? 'aspect-square text-[12px]' : 'aspect-[3/4] gap-0.5 rounded-xl',
                c.value === null ? (c.rest ? 'border-dashed border-foreground/15 bg-transparent' : 'border-transparent bg-surface-2/40') : 'border-transparent bg-surface-2',
                isSel && 'ring-2 ring-foreground ring-offset-2 ring-offset-surface',
                isToday && !isSel && 'border-(--c) border-2',
              )}
            >
              {mode === 'semana' && <span className="font-display text-[20px] leading-none font-black opacity-80">{DOW[i]}</span>}
              <span className={cn('tabular font-semibold', mode === 'semana' ? 'text-[11px] opacity-70' : 'opacity-85', c.value === null && 'text-muted-foreground')}>
                {parseIso(d).getDate()}
              </span>
              {mode === 'semana' && (
                <span className="tabular text-[10.5px] leading-none font-bold tracking-tight sm:text-[12px]">
                  {pct === null ? '–' : pct}
                  {pct !== null && <span className="text-[8.5px] sm:text-[10px]">%</span>}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12.5px]">
        <p className="min-w-0 text-muted-foreground">
          {selCell ? (
            <>
              <b className="text-foreground first-letter:uppercase">{parseIso(sel!).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}</b> · {selCell.hint}
            </>
          ) : (
            'Toca un día para ver el detalle'
          )}
        </p>
        <span className="flex items-center gap-1 text-muted-foreground" style={legendVars} aria-hidden>
          Menos
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <span key={v} className="size-3 rounded-[3px] bg-surface-2" style={fill(v)} />
          ))}
          Más
        </span>
      </div>
    </section>
  );
}
