import { motion } from 'motion/react';
import { Flame } from 'lucide-react';
import { GRIPS, PRIORITIES, RULES, TECHNIQUES, VOLUME } from '@/data/rutina';
import { FST7_PLAN } from '@/lib/progression';
import { exerciseById, DAYS } from '@/data/rutina';
import { WEEK } from '@/data/schedule';
import { cn } from '@/lib/utils';

const SECTIONS = [
  ['agarres', 'Agarres'],
  ['tecnicas', 'Técnicas'],
  ['volumen', 'Volumen'],
  ['reglas', 'Reglas'],
  ['prioridades', 'Prioridades'],
  ['fst7', 'FST-7'],
] as const;

/** Navegación interna por JS (el visor del celular bloquea los enlaces con #). */
function jump(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 120;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

export function GuideView() {
  return (
    <div className="space-y-12">
      <header>
        <h1 className="font-display text-[clamp(52px,13vw,88px)] leading-[0.85] font-black uppercase">Guía</h1>
        <p className="mt-3 max-w-[60ch] text-[15.5px] text-muted-foreground">
          Rutina avanzada Upper/Lower + PPL de 5 días para volumen limpio. Basada en los principios de Jeff Nippard, con prioridad en hombro frontal, hombro posterior,
          espalda media y espalda baja.
        </p>
        <div className="no-scrollbar sticky top-14 z-20 -mx-4 mt-5 flex gap-1.5 overflow-x-auto bg-background/80 px-4 py-2 backdrop-blur-xl">
          {SECTIONS.map(([id, label]) => (
            <button key={id} onClick={() => jump(id)} className="shrink-0 rounded-full border bg-surface px-3.5 py-1.5 text-[13.5px] font-semibold hover:border-neon">
              {label}
            </button>
          ))}
        </div>
      </header>

      <Section id="agarres" title="Agarres" intro="Cada ejercicio indica su agarre. El ancho se describe aparte: cerrado (menos que los hombros), al ancho de hombros o abierto (más que los hombros).">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {GRIPS.map((g, i) => (
            <Card key={g.name} className="flex gap-4">
              <GripIcon i={i} />
              <div>
                <h3 className="font-display text-2xl font-extrabold">{g.name}</h3>
                <p className="text-[14.5px] text-muted-foreground">{g.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="tecnicas" title="Técnicas de intensidad" intro="Se aplican solo en la última serie del ejercicio y solo en aislamientos o máquinas.">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {TECHNIQUES.map((t) => (
            <div key={t.name} className="rounded-r-2xl border-l-4 border-neon bg-surface p-4">
              <h3 className="font-display text-2xl font-extrabold">{t.name}</h3>
              <p className="text-[14.5px] text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="volumen" title="Volumen semanal" intro="Series directas por semana con los ajustes de prioridad. La banda punteada marca el rango de 10–20 series que recomienda Nippard para los músculos grandes.">
        <div className="space-y-2.5">
          {VOLUME.map((v, i) => (
            <div key={v.muscle} className="grid grid-cols-[7.5rem_1fr_2.25rem] items-center gap-3 text-[14px] sm:grid-cols-[11rem_1fr_2.75rem]">
              <span className="leading-tight">{v.muscle}</span>
              <div className="relative h-3.5 overflow-hidden rounded-full bg-surface-2">
                <motion.div
                  className={cn('absolute inset-y-0 left-0 rounded-full', v.indirect ? 'bg-muted-foreground/60' : 'bg-neon shadow-[0_0_12px_var(--neon)]')}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(v.sets / 22) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="absolute inset-y-0 border-x border-dashed border-foreground/50" style={{ left: `${(10 / 22) * 100}%`, width: `${(10 / 22) * 100}%` }} />
              </div>
              <b className="font-display tabular text-right text-2xl font-black">{v.sets}</b>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[13.5px] text-muted-foreground">En gris, los músculos que reciben además mucho trabajo indirecto de los ejercicios compuestos.</p>
      </Section>

      <Section id="reglas" title="Reglas de ejecución">
        <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2">
          {RULES.map((r) => (
            <div key={r.name} className="bg-background p-4">
              <h3 className="font-display text-[22px] font-extrabold text-neon">{r.name}</h3>
              <p className="text-[14.5px]">{r.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="prioridades"
        title="Prioridades"
        intro="Los ejercicios con barra roja a la izquierda son los que atacan tus puntos rezagados. El hombro lateral, que ya está bien desarrollado, queda en volumen de mantenimiento."
      >
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PRIORITIES.map((p) => (
            <Card key={p.name} className="border-t-4 border-t-neon">
              <h3 className="font-display text-[22px] font-extrabold">{p.name}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[14.5px] text-muted-foreground">
                {p.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <h3 className="font-display mt-6 text-2xl font-extrabold">Seguimiento</h3>
        <p className="mt-1 max-w-[62ch] text-[14.5px] text-muted-foreground">
          Tómate fotos de frente, de lado y de espalda cada 4–6 semanas, con la misma luz y a la misma hora. Prioriza lo que veas atrasado; ninguna rutina conoce tus puntos
          débiles mejor que tus fotos.
        </p>
      </Section>

      <Section id="fst7" title="Opción FST-7">
        <div className="grain rounded-2xl border-2 border-neon bg-surface p-5">
          <p className="font-display text-glow text-[clamp(52px,12vw,84px)] leading-[0.9] font-black text-neon">7 × 10–12</p>
          <p className="mt-3 text-[15px]">
            Método de Hany Rambod. En el <b>último aislamiento</b> de un músculo rezagado, cambia sus series por 7 series de 10–12 repeticiones con 30–45 s de descanso,
            estirando el músculo e hidratándote entre series.
          </p>
          <p className="mt-2 text-[15px]">
            Úsalo en 1–2 músculos a la vez como máximo. Candidatos en esta rutina: la elevación frontal en polea (lunes) o el pec deck invertido (jueves).
          </p>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            La teoría de que estira la fascia no tiene respaldo sólido; lo que funciona es que suma volumen con mucho esfuerzo y descansos cortos.
          </p>
        </div>
        <h3 className="font-display mt-6 flex items-center gap-2 text-2xl font-extrabold">
          <Flame className="size-5 text-warn" /> Recomendación por bloque
        </h3>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {(['odd', 'even'] as const).map((k) => (
            <Card key={k}>
              <p className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">{k === 'odd' ? 'Bloques 1, 3, 5…' : 'Bloques 2, 4, 6…'}</p>
              <ul className="mt-2 space-y-2">
                {FST7_PLAN[k].map((f) => (
                  <li key={f.id} className="text-[14px]">
                    <b>{exerciseById(f.id)!.name}</b> <span className="text-muted-foreground">· {dayName(f.id)}</span>
                    <p className="text-foreground/70">{f.why}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[14px] text-muted-foreground">
          <li>Empieza después del arranque (semana 3) y nunca en la semana de descarga.</li>
          <li>Nunca en compuestos ni en las hiperextensiones: la fatiga lumbar se acumula con el rumano.</li>
          <li>Las series FST-7 se registran aparte y no cuentan para la recomendación de subir peso.</li>
        </ul>
      </Section>

      <footer className="border-t-4 border-neon pt-5 text-[13px] text-muted-foreground">
        Rutina construida con los principios públicos de Jeff Nippard; no es copia de un programa pagado suyo. La sección FST-7 se basa en el método de Hany Rambod.
      </footer>
    </div>
  );
}

const dayName = (exerciseId: string) => {
  const w = WEEK.find((x) => x.day && DAYS[x.day].exercises.some((e) => e.id === exerciseId));
  return w ? `${w.name} (${DAYS[w.day!].title})` : '';
};

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="font-display text-[clamp(36px,8vw,54px)] leading-none font-black uppercase">{title}</h2>
      {intro && <p className="mt-2 mb-4 max-w-[62ch] text-[15px] text-muted-foreground">{intro}</p>}
      {!intro && <div className="mb-4" />}
      {children}
    </section>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('grain rounded-2xl border bg-surface p-4', className)}>{children}</div>;
}

/** Íconos de agarre del diseño original. */
function GripIcon({ i }: { i: number }) {
  const common = { viewBox: '0 0 46 46', className: 'size-12 shrink-0', 'aria-hidden': true } as const;
  const bar = 'var(--muted-foreground)';
  const hand = 'var(--neon)';
  const ink = 'var(--foreground)';
  if (i === 0)
    return (
      <svg {...common}>
        <rect x="3" y="20" width="40" height="6" rx="2" fill={bar} />
        <rect x="12" y="12" width="9" height="22" rx="4" fill={hand} />
        <rect x="25" y="12" width="9" height="22" rx="4" fill={hand} />
        <path d="M16.5 8v-5M29.5 8v-5" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  if (i === 1)
    return (
      <svg {...common}>
        <rect x="3" y="20" width="40" height="6" rx="2" fill={bar} />
        <rect x="12" y="12" width="9" height="22" rx="4" fill={hand} />
        <rect x="25" y="12" width="9" height="22" rx="4" fill={hand} />
        <path d="M16.5 38v5M29.5 38v5" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  if (i === 2)
    return (
      <svg {...common}>
        <rect x="10" y="4" width="6" height="38" rx="2" fill={bar} />
        <rect x="30" y="4" width="6" height="38" rx="2" fill={bar} />
        <rect x="6" y="17" width="14" height="12" rx="4" fill={hand} />
        <rect x="26" y="17" width="14" height="12" rx="4" fill={hand} />
        <path d="M21 23h4" stroke={ink} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg {...common}>
      <g transform="rotate(-25 23 23)">
        <rect x="3" y="20" width="40" height="6" rx="2" fill={bar} />
        <rect x="10" y="14" width="9" height="18" rx="4" fill={hand} />
        <rect x="27" y="14" width="9" height="18" rx="4" fill={hand} />
      </g>
    </svg>
  );
}
