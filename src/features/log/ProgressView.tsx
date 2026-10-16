import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Flame, NotebookPen } from 'lucide-react';
import { NumberTicker } from '@/components/ui/number-ticker';
import { DAYS, exerciseById } from '@/data/rutina';
import { WEEK, WEEK_ORDER } from '@/data/schedule';
import type { Block } from '@/hooks/useBlock';
import { advise, fmtWeight, workingWeight } from '@/lib/progression';
import { historyOf, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AdviceBadge } from './AdviceBadge';
import { HistoryChart } from './HistoryChart';
import { useLogger } from './logger-context';
import { BlockBanner } from '@/features/today/TodayView';
import { typeOf, typeVars } from '@/lib/theme';

export function ProgressView({ block }: { block: Block }) {
  const sessions = useStore((s) => s.sessions);
  const [open, setOpen] = useState<string | null>(null);
  const logger = useLogger();

  const stats = useMemo(() => {
    const all = Object.values(sessions);
    const ready = Object.values(DAYS)
      .flatMap((d) => d.exercises)
      .filter((e) => advise(e, historyOf(sessions, e.id)).verdict === 'up').length;
    return { sessions: all.length, days: new Set(all.map((s) => s.date)).size, ready };
  }, [sessions]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[clamp(52px,13vw,88px)] leading-[0.85] font-black uppercase">Progreso</h1>
        <p className="mt-3 max-w-[60ch] text-[15.5px] text-muted-foreground">
          Doble progresión: cuando completes todas las series en el tope del rango, sube entre 2.5 y 5% y vuelve al mínimo.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Tile big label={block.started ? `bloque ${block.block}` : 'sin empezar'} value={block.started ? block.week : 0} prefix="Sem " />
        <Tile label="días entrenados" value={stats.days} />
        <Tile label="ejercicios registrados" value={stats.sessions} />
        <Tile label="listos para subir" value={stats.ready} accent />
      </div>

      {block.started && (
        <div className="flex gap-1.5" aria-label={`Semana ${block.weekInBlock} de 6 del bloque`}>
          {Array.from({ length: 6 }, (_, i) => (
            <span
              key={i}
              className={cn('h-2 flex-1 rounded-full', i < block.weekInBlock ? (i === 5 ? 'bg-warn' : 'bg-neon') : 'bg-surface-2')}
            />
          ))}
        </div>
      )}

      <BlockBanner block={block} />

      <section className="grain rounded-2xl border border-warn/30 bg-surface p-4 sm:p-5">
        <div className="flex items-center gap-2 text-warn">
          <Flame className="size-5" />
          <h2 className="font-display text-2xl font-black uppercase">FST-7 · bloque {block.block}</h2>
        </div>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {block.rampUp
            ? 'Se activa después del arranque (semana 3). Mientras, entrena normal.'
            : block.deload
              ? 'En descarga no se usa FST-7.'
              : 'Actívalo con el interruptor del registrador en estos ejercicios: 7 × 10–12, 30–45 s de descanso, en la última posición del músculo.'}
        </p>
        <ul className="mt-3 space-y-2">
          {block.fst7.map((f) => {
            const ex = exerciseById(f.id)!;
            const wd = WEEK.findIndex((w) => w.day && DAYS[w.day].exercises.some((e) => e.id === f.id));
            return (
              <li key={f.id} className="rounded-xl border bg-surface-2 p-3">
                <p className="font-semibold">
                  {ex.name} <span className="text-muted-foreground">· {WEEK[wd].name}</span>
                </p>
                <p className="mt-0.5 text-[13.5px] text-foreground/70">{f.why}</p>
              </li>
            );
          })}
        </ul>
      </section>

      {WEEK_ORDER.filter((wd) => WEEK[wd].day).map((wd) => {
        const day = DAYS[WEEK[wd].day!];
        return (
          <section key={wd} style={typeVars(typeOf(day))}>
            <h2 className="font-display mb-2 text-3xl font-black uppercase">
              <span className="text-(--c)">{WEEK[wd].name}</span> · {day.title}
            </h2>
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border bg-surface">
              {day.exercises.map((ex) => {
                const h = historyOf(sessions, ex.id);
                const adv = advise(ex, h, block);
                const isOpen = open === ex.id;
                return (
                  <li key={ex.id}>
                    <button onClick={() => setOpen(isOpen ? null : ex.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{ex.name}</span>
                        <span className="tabular text-[13px] text-muted-foreground">
                          {h[0] ? `${fmtWeight(workingWeight(h[0]))} ${h[0].unit} × ${h[0].sets.map((s) => s.reps).join('/')}` : `${ex.sets} × ${ex.reps.join('–')} · sin registros`}
                        </span>
                      </span>
                      {h[0] && <AdviceBadge advice={adv} className="hidden sm:inline-flex" />}
                      <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-3 px-4 pb-4">
                            {h[0] && <AdviceBadge advice={adv} className="sm:hidden" />}
                            {h[0] && <p className="text-[13.5px] text-foreground/70">{adv.detail}</p>}
                            <HistoryChart history={h} />
                            <button
                              onClick={() => logger.open(ex)}
                              className="inline-flex h-9 items-center gap-2 rounded-full bg-neon px-4 text-sm font-semibold text-white"
                            >
                              <NotebookPen className="size-4" /> Registrar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function Tile({ label, value, prefix, accent, big }: { label: string; value: number; prefix?: string; accent?: boolean; big?: boolean }) {
  return (
    <div className={cn('grain rounded-2xl border p-4', accent ? 'border-ok/30 bg-ok/5' : 'bg-surface', big && 'border-neon/40')}>
      <p className={cn('font-display tabular text-[40px] leading-none font-black', accent && 'text-ok')}>
        {prefix && <span className="text-[22px] text-muted-foreground">{prefix}</span>}
        <NumberTicker value={value} className={accent ? 'text-ok' : 'text-foreground'} />
      </p>
      <p className="mt-1.5 text-[12.5px] text-muted-foreground">{label}</p>
    </div>
  );
}
