import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ChevronDown, CircleDashed, Flame, Lightbulb, NotebookPen } from 'lucide-react';
import type { Exercise } from '@/data/rutina';
import { useLogger } from '@/features/log/logger-context';
import { AdviceBadge } from '@/features/log/AdviceBadge';
import { advise, FST7_REPS, FST7_SETS, fmtWeight, workingWeight } from '@/lib/progression';
import { historyOf, useStore } from '@/lib/store';
import { fst7Allowed, type Block } from '@/hooks/useBlock';
import { cn } from '@/lib/utils';

/**
 * Tarjeta de ejercicio. Con `why` es una recomendación opcional: va en el color `--rec`.
 * `done` marca si ya se registró (hoy o esta semana, según la vista).
 */
export function ExerciseCard({ ex, index, block, why, done }: { ex: Exercise; index: number | string; block: Block; why?: string; done?: boolean }) {
  const extra = why !== undefined;
  const [open, setOpen] = useState(false);
  const logger = useLogger();
  const sessions = useStore((s) => s.sessions);
  const fst7On = useStore((s) => !!s.fst7[ex.id]) && fst7Allowed(block, ex.id);
  const history = historyOf(sessions, ex.id);
  const advice = advise(ex, history, block);
  const last = history[0];
  const recommendedFst7 = block.fst7.some((f) => f.id === ex.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'grain relative overflow-hidden rounded-2xl border bg-surface p-4 sm:p-5',
        ex.priority && !extra && 'bg-gradient-to-r from-neon-soft via-surface to-surface',
        extra && 'border-dashed border-rec/50 bg-gradient-to-r from-rec/10 via-surface to-surface',
        done && !extra && 'border-(--c)/45',
      )}
    >
      {ex.priority && !extra && <span className="absolute inset-y-4 left-0 w-1 rounded-r bg-neon shadow-[0_0_14px_var(--neon)]" />}
      {extra && <span className="absolute inset-y-4 left-0 w-1 rounded-r bg-rec shadow-[0_0_14px_var(--rec)]" />}

      <div className="grid grid-cols-[2rem_1fr] gap-x-3 sm:grid-cols-[2.25rem_1fr_auto]">
        <span className={cn('font-display text-[28px] leading-none font-extrabold', extra ? 'text-rec' : 'text-muted-foreground/70')}>{index}</span>
        <div className="min-w-0">
          {(extra || done !== undefined) && (
            <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[11.5px] font-bold tracking-wider uppercase">
              {extra && <span className="rounded-md bg-rec px-1.5 py-0.5 text-(--rec-ink)">Recomendado · opcional</span>}
              {done ? (
                <span className={cn('inline-flex items-center gap-1', extra ? 'text-rec' : 'text-(--c)')}>
                  <CheckCircle2 className="size-3.5" /> Hecho
                </span>
              ) : (
                done === false && (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <CircleDashed className="size-3.5" /> Pendiente
                  </span>
                )
              )}
            </p>
          )}
          <h3 className="text-[17px] leading-snug font-semibold text-balance">{ex.name}</h3>
        </div>
        <div className="col-start-2 mt-2 sm:col-start-3 sm:row-start-1 sm:mt-0 sm:text-right">
          <p className="font-display tabular text-[30px] leading-none font-black">
            {fst7On ? `${FST7_SETS} × ${FST7_REPS.join('–')}` : `${ex.sets} × ${ex.reps.join('–')}`}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">series × reps</p>
        </div>

        <div className="col-start-2 mt-3 flex flex-wrap gap-1.5 sm:col-span-2">
          <Chip kind="grip" rec={extra}>{ex.grip}</Chip>
          <Chip kind="effort" rec={extra}>{fst7On ? 'FST-7 · 30–45 s de descanso' : ex.effort}</Chip>
          {ex.priority && <Chip kind="prio">Prioridad: {ex.priority}</Chip>}
          {recommendedFst7 && !fst7On && <Chip kind="fst">FST-7 recomendado</Chip>}
        </div>

        {ex.note && <p className="col-start-2 mt-2.5 text-[14.5px] text-muted-foreground sm:col-span-2">{ex.note}</p>}
        {extra && (
          <p className="col-start-2 mt-2.5 flex gap-2 rounded-xl border border-rec/25 bg-rec/5 p-2.5 text-[13.5px] text-foreground/80 sm:col-span-2">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-rec" />
            {why}
          </p>
        )}

        <div className="col-start-2 mt-4 flex flex-wrap items-center gap-2 sm:col-span-2">
          <button
            onClick={() => logger.open(ex)}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold transition active:scale-95',
              extra ? 'bg-rec text-(--rec-ink) shadow-[0_6px_24px_-6px_var(--rec)]' : 'bg-neon text-white shadow-[0_6px_24px_-6px_var(--neon)]',
            )}
          >
            <NotebookPen className="size-4" /> Registrar
          </button>
          {last ? (
            <AdviceBadge advice={advice} />
          ) : (
            <span className="text-[13px] text-muted-foreground">Sin registros todavía</span>
          )}
          {last && (
            <span className="tabular text-[13px] text-muted-foreground">
              Última: {fmtWeight(workingWeight(last))} {last.unit} × {last.sets.map((s) => s.reps).join('/')}
            </span>
          )}
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={cn('col-start-2 mt-3 inline-flex w-fit items-center gap-1 text-[14px] font-semibold sm:col-span-2', extra ? 'text-rec' : 'text-neon')}
        >
          Variaciones
          <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-2 overflow-hidden sm:col-span-2"
            >
              {ex.variations.map(([name, detail]) => (
                <li key={name} className="mt-2 flex gap-2 text-[14.5px]">
                  <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', extra ? 'bg-rec/70' : 'bg-neon/70')} />
                  <span>
                    {name} <span className="text-muted-foreground">({detail})</span>
                  </span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}

function Chip({ kind, rec, children }: { kind: 'grip' | 'effort' | 'prio' | 'fst'; rec?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[13px] font-medium',
        kind === 'grip' && 'border-border bg-surface-2',
        kind === 'effort' && (rec ? 'border-rec bg-rec text-(--rec-ink)' : 'border-neon bg-neon text-white'),
        kind === 'prio' && 'border-dashed border-neon text-neon',
        kind === 'fst' && 'border-warn/50 text-warn',
      )}
    >
      {kind === 'grip' && <span className={cn('size-1.5 rounded-full', rec ? 'bg-rec' : 'bg-neon')} />}
      {kind === 'fst' && <Flame className="size-3.5" />}
      {children}
    </span>
  );
}
