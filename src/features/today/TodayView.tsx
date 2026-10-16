import { useMemo } from 'react';
import { ArrowRight, BatteryCharging, Moon, Rocket, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BorderBeam } from '@/components/ui/border-beam';
import { NumberTicker } from '@/components/ui/number-ticker';
import { Spotlight } from '@/components/ui/spotlight';
import { TextEffect } from '@/components/ui/text-effect';
import { TextShimmer } from '@/components/ui/text-shimmer';
import { dayFor, nextSession, WEEK } from '@/data/schedule';
import { ExerciseCard } from '@/features/day/ExerciseCard';
import type { Block } from '@/hooks/useBlock';
import { isoDate } from '@/lib/date';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { WeekStrip } from '@/features/day/WeekStrip';
import { TYPE_LABEL, typeOf, typeVars, usePrefs } from '@/lib/theme';

export function TodayView({ today, block, onOpenDay }: { today: Date; block: Block; onOpenDay: (weekday: number) => void }) {
  const wd = today.getDay();
  const day = dayFor(wd);
  const next = nextSession(wd);
  const date = isoDate(today);
  const sessions = useStore((s) => s.sessions);
  const loggedToday = useMemo(
    () => new Set(Object.values(sessions).filter((x) => x.date === date).map((x) => x.exerciseId)),
    [sessions, date],
  );
  const { name } = usePrefs();
  const type = day ? typeOf(day) : null;
  const dateLabel = today.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });

  const done = day ? day.exercises.filter((e) => loggedToday.has(e.id)).length : 0;
  const totalSets = day ? day.exercises.reduce((n, e) => n + e.sets, 0) : 0;

  return (
    <div className="space-y-6">
      <section
        style={typeVars(type)}
        className={cn('grain relative overflow-hidden rounded-3xl border bg-surface px-5 pt-6 pb-5 sm:px-7 sm:pt-8', type && 'border-(--c)/30')}
      >
        <Spotlight className="from-(--c)/40 via-(--c)/10 to-transparent blur-2xl" size={260} />
        {type && <BorderBeam size={120} duration={9} colorFrom="var(--c)" colorTo="#ffffff" />}
        <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full border-[44px] border-(--c)/15" />

        <p className="text-[15px] font-semibold">
          Bienvenido, <span className="text-(--c)">{name}</span>
        </p>
        <p className="mt-1 text-[12.5px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">Hoy · {dateLabel}</p>
        <TextEffect
          as="h1"
          per="char"
          preset="fade-in-blur"
          className="font-display text-glow mt-2 text-[clamp(72px,22vw,148px)] leading-[0.82] font-black tracking-tight uppercase"
        >
          {day ? day.title : 'Descanso'}
        </TextEffect>
        <p className="mt-3 max-w-[46ch] text-[15.5px] text-foreground/75">
          {day && type ? (
            <>
              <span className="mr-1.5 inline-block rounded-md bg-(--c) px-2 py-0.5 align-[2px] text-[11.5px] font-black tracking-wider text-(--c-ink) uppercase">
                {TYPE_LABEL[type].long}
              </span>
              {day.focus.replace(/^(Fuerza|Hipertrofia)\. /, '')}
            </>
          ) : (
            'Recupera: come tus 170 g de proteína y duerme 7–9 horas. El crecimiento pasa hoy.'
          )}
        </p>

        {day ? (
          <div className="mt-6 grid grid-cols-3 gap-2">
            <Stat label="ejercicios" value={day.exercises.length} />
            <Stat label="series" value={totalSets} />
            <Stat label="min aprox." text={day.minutes.replace(' min', '')} />
          </div>
        ) : (
          <button
            onClick={() => onOpenDay(next.weekday)}
            className="mt-6 flex w-full items-center justify-between rounded-2xl border bg-surface-2 p-4 text-left transition hover:border-neon/50"
          >
            <span>
              <span className="block text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
                {next.inDays === 1 ? 'Mañana' : `En ${next.inDays} días`} · {WEEK[next.weekday].name}
              </span>
              <span className="font-display text-3xl font-black uppercase">{next.day.title} {next.day.heavy ? 'fuerza' : ''}</span>
            </span>
            <ArrowRight className="size-6 text-neon" />
          </button>
        )}

        {day && (
          <div className="mt-5">
            <div className="flex justify-between text-[12.5px] text-muted-foreground">
              <span>Registrado hoy</span>
              <span className="tabular">{done}/{day.exercises.length}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <motion.div
                className="h-full rounded-full bg-(--c) shadow-[0_0_12px_var(--c)]"
                initial={false}
                animate={{ width: `${(done / day.exercises.length) * 100}%` }}
                transition={{ type: 'spring', bounce: 0, duration: 0.6 }}
              />
            </div>
          </div>
        )}
      </section>

      <BlockBanner block={block} />

      <WeekStrip today={wd} selected={wd} onSelect={onOpenDay} />

      {day && (
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl font-black uppercase">La sesión</h2>
            <TextShimmer className="text-[13px] font-semibold [--base-color:var(--muted-foreground)] [--base-gradient-color:#fff]" duration={2.5}>
              {`Duración ${day.minutes}`}
            </TextShimmer>
          </div>
          {day.exercises.map((ex, i) => (
            <ExerciseCard key={ex.id} ex={ex} index={i + 1} block={block} />
          ))}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, text }: { label: string; value?: number; text?: string }) {
  return (
    <div className="rounded-2xl border bg-background/40 p-3">
      <p className="font-display tabular text-[34px] leading-none font-black">
        {value !== undefined ? <NumberTicker value={value} className="text-foreground" /> : text}
      </p>
      <p className="mt-1 text-[12px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function BlockBanner({ block }: { block: Block }) {
  if (!block.started)
    return (
      <Banner icon={Rocket} tone="neon" title="El registro empieza esta semana">
        Pulsa <b>Registrar</b> en cada ejercicio y anota el peso y las reps que hiciste. Con la primera semana completa empiezan las recomendaciones para subir peso.
      </Banner>
    );
  if (block.deload)
    return (
      <Banner icon={BatteryCharging} tone="warn" title={`Semana ${block.week} · Descarga`}>
        La mitad de las series, a RIR 3–4 y sin técnicas. Llegas fresco al bloque {block.block + 1}.
      </Banner>
    );
  if (block.rampUp)
    return (
      <Banner icon={Sparkles} tone="neon" title={`Semana ${block.week} de 2 · Arranque`}>
        Todo a RIR 1–2, sin técnicas de intensidad. Desde la semana 3 sigues lo que indica cada ejercicio.
      </Banner>
    );
  return (
    <Banner icon={Moon} tone="muted" title={`Bloque ${block.block} · semana ${block.weekInBlock} de 6`}>
      {block.weekInBlock === 5 ? 'La próxima semana es de descarga.' : 'Sigue con la doble progresión: las recomendaciones de cada ejercicio te dicen cuándo subir.'}
    </Banner>
  );
}

function Banner({ icon: Icon, tone, title, children }: { icon: typeof Moon; tone: 'neon' | 'warn' | 'muted'; title: string; children: React.ReactNode }) {
  const cls = tone === 'neon' ? 'border-neon/40 bg-neon-soft' : tone === 'warn' ? 'border-warn/40 bg-warn/10' : 'bg-surface';
  const ic = tone === 'neon' ? 'text-neon' : tone === 'warn' ? 'text-warn' : 'text-muted-foreground';
  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${cls}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${ic}`} />
      <div>
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-[14px] text-foreground/75">{children}</p>
      </div>
    </div>
  );
}
