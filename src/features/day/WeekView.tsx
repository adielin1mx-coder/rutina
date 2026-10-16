import { AnimatePresence, motion } from 'motion/react';
import { Info, Moon } from 'lucide-react';
import { dayFor, nextSession, WEEK } from '@/data/schedule';
import type { Block } from '@/hooks/useBlock';
import { ExerciseCard } from './ExerciseCard';
import { WeekStrip } from './WeekStrip';
import { TYPE_LABEL, typeOf, typeVars } from '@/lib/theme';

export function WeekView({ today, selected, onSelect, block }: { today: number; selected: number; onSelect: (wd: number) => void; block: Block }) {
  const day = dayFor(selected);
  const w = WEEK[selected];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[clamp(52px,13vw,88px)] leading-[0.85] font-black uppercase">La semana</h1>
        <p className="mt-3 max-w-[60ch] text-[15.5px] text-muted-foreground">
          Cada músculo se entrena 2 veces por semana. Lunes a miércoles son de volumen; jueves y viernes son pesados.
        </p>
      </header>

      <WeekStrip today={today} selected={selected} onSelect={onSelect} />

      <AnimatePresence mode="wait">
        <motion.section
          key={selected}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="space-y-3"
        >
          <div style={typeVars(day ? typeOf(day) : null)} className="flex items-end gap-4 border-b-2 border-(--c) pb-3">
            <span className="font-display text-[clamp(64px,15vw,104px)] leading-[0.78] font-black text-(--c)">{w.short}</span>
            <div className="min-w-0">
              {day && (
                <span className="mb-1 inline-block rounded-md bg-(--c) px-2 py-0.5 text-[11px] font-black tracking-wider text-(--c-ink) uppercase">
                  {TYPE_LABEL[typeOf(day)].long}
                </span>
              )}
              <h2 className="font-display text-[clamp(34px,7vw,52px)] leading-none font-black uppercase">
                {w.name} · {day ? day.title : 'Descanso'}
              </h2>
              {day && (
                <p className="mt-1 text-[14.5px] text-muted-foreground">
                  {day.focus} Duración aproximada: {day.minutes}.
                </p>
              )}
            </div>
          </div>

          {day ? (
            <>
              {day.id === 'pierna-hipertrofia' && (
                <Note>
                  Las hiperextensiones de hoy quedan a un día del peso muerto rumano del viernes. Si notas rigidez lumbar el viernes, aplica la regla “Espalda baja”: baja las
                  hiperextensiones a 2 series o a RIR 2.
                </Note>
              )}
              {day.exercises.map((ex, i) => (
                <ExerciseCard key={ex.id} ex={ex} index={i + 1} block={block} />
              ))}
            </>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-dashed p-5 text-muted-foreground">
              <Moon className="size-5" />
              Día de descanso. Próxima sesión: {WEEK[nextSession(selected).weekday].name} · {nextSession(selected).day.title}.
            </div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-xl border bg-surface p-3 text-[13.5px] text-foreground/75">
      <Info className="mt-0.5 size-4 shrink-0 text-warn" />
      <p>{children}</p>
    </div>
  );
}
