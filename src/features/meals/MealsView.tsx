import { useMemo, useRef, useState } from 'react';
import { animate } from 'animejs';
import { Check, Flame, Pencil, Plus, Trash2, Utensils } from 'lucide-react';
import { toast } from 'sonner';
import { NumberTicker } from '@/components/ui/number-ticker';
import { ProgressRing } from '@/components/ProgressRing';
import { prefersReducedMotion } from '@/hooks/useAnime';
import { mealStats } from '@/lib/adherence';
import { isoDate, parseIso } from '@/lib/date';
import { toggleMeal, useStore } from '@/lib/store';
import { DEFAULT_MEALS, setPrefs, usePrefs } from '@/lib/theme';
import { cn } from '@/lib/utils';

const DOW = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

/** Registro diario de comidas: solo checks para contar cuántas hiciste. */
export function MealsView({ today }: { today: Date }) {
  const { meals: names } = usePrefs();
  const meals = useStore((s) => s.meals);
  const [date, setDate] = useState(() => isoDate(today));
  const [editing, setEditing] = useState(false);
  const stats = useMemo(() => mealStats(meals, names, today), [meals, names, today]);

  const checked = new Set(meals[date] ?? []);
  const n = names.filter((m) => checked.has(m)).length;
  const isToday = date === isoDate(today);
  const label = isToday ? 'Hoy' : parseIso(date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-[clamp(52px,13vw,88px)] leading-[0.85] font-black uppercase">Comidas</h1>
        <p className="mt-3 max-w-[60ch] text-[15.5px] text-muted-foreground">Marca cada comida que hagas en el día. Solo cuenta cuántas llevas.</p>
      </header>

      {/* Últimos 7 días: elegir día y ver su avance */}
      <div className="grid grid-cols-7 gap-1.5">
        {stats.last7.map((d) => {
          const sel = d.date === date;
          const full = d.n >= stats.goal;
          return (
            <button
              key={d.date}
              onClick={() => setDate(d.date)}
              aria-pressed={sel}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-2 transition-colors',
                sel ? 'border-ok bg-ok/10' : 'bg-surface',
              )}
            >
              <span className={cn('font-display text-[20px] leading-none font-black', sel ? 'text-ok' : 'text-muted-foreground')}>
                {DOW[parseIso(d.date).getDay()]}
              </span>
              <span className="text-[11px] text-muted-foreground">{parseIso(d.date).getDate()}</span>
              <span className="relative h-8 w-1.5 overflow-hidden rounded-full bg-foreground/10">
                <span
                  className={cn('absolute inset-x-0 bottom-0 rounded-full transition-all', full ? 'bg-ok shadow-[0_0_8px_var(--ok)]' : 'bg-ok/60')}
                  style={{ height: `${(d.n / stats.goal) * 100}%` }}
                />
              </span>
              <span className="tabular text-[10.5px] font-semibold">
                {d.n}/{stats.goal}
              </span>
            </button>
          );
        })}
      </div>

      <section className="grain flex items-center gap-5 rounded-3xl border bg-surface p-5">
        <ProgressRing value={n / stats.goal} size={116} stroke={10} color="var(--ok)">
          <span className="text-center">
            <span className="font-display tabular block text-[40px] leading-none font-black">
              {n}
              <span className="text-[22px] text-muted-foreground">/{stats.goal}</span>
            </span>
          </span>
        </ProgressRing>
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">{label}</p>
          <p className="font-display mt-1 text-[32px] leading-none font-black uppercase">
            {n >= stats.goal ? 'Completo' : `Faltan ${stats.goal - n}`}
          </p>
          {!isToday && (
            <button onClick={() => setDate(isoDate(today))} className="mt-2 text-[13px] font-semibold text-ok">
              Volver a hoy
            </button>
          )}
        </div>
      </section>

      <ul className="space-y-2">
        {names.map((m) => (
          <MealRow key={m} name={m} done={checked.has(m)} onToggle={() => toggleMeal(date, m)} />
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-2.5">
        <Tile icon={<Flame className="size-4 text-warn" />} value={stats.streak} label="días completos seguidos" />
        <Tile value={Math.round(stats.weekAvg * 10) / 10} decimals={1} label="promedio por día (semana)" />
        <Tile value={stats.total} label="comidas registradas" />
      </div>

      <section className="grain rounded-2xl border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-black uppercase">Mis comidas</h2>
          <button onClick={() => setEditing((e) => !e)} className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ok">
            <Pencil className="size-4" /> {editing ? 'Listo' : 'Editar'}
          </button>
        </div>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          {names.length} comidas al día. {editing ? 'Cambia el nombre, agrega o quita.' : 'Puedes cambiarlas cuando quieras.'}
        </p>
        {editing && <MealEditor names={names} />}
      </section>
    </div>
  );
}

function MealRow({ name, done, onToggle }: { name: string; done: boolean; onToggle: () => void }) {
  const box = useRef<HTMLSpanElement>(null);
  function click() {
    onToggle();
    navigator.vibrate?.(8);
    if (box.current && !prefersReducedMotion()) animate(box.current, { scale: [0.6, 1.15, 1], rotate: done ? 0 : [-12, 0], duration: 450, ease: 'outBack' });
  }
  return (
    <li>
      <button
        onClick={click}
        aria-pressed={done}
        className={cn(
          'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
          done ? 'border-ok/40 bg-ok/10' : 'bg-surface hover:border-foreground/20',
        )}
      >
        <span
          ref={box}
          className={cn('grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors', done ? 'border-ok bg-ok text-background' : 'border-foreground/25')}
        >
          {done && <Check className="size-4" strokeWidth={3.5} />}
        </span>
        <span className={cn('flex-1 text-[17px] font-semibold', done && 'text-foreground/70 line-through decoration-ok/60')}>{name}</span>
        <Utensils className={cn('size-4', done ? 'text-ok' : 'text-muted-foreground/50')} />
      </button>
    </li>
  );
}

function MealEditor({ names }: { names: string[] }) {
  const [draft, setDraft] = useState('');
  const save = (list: string[]) => setPrefs({ meals: list });

  function rename(i: number, value: string) {
    const v = value.trim();
    if (!v || names.some((n, j) => j !== i && n === v)) return;
    save(names.map((n, j) => (j === i ? v : n)));
  }
  function add() {
    const v = draft.trim();
    if (!v) return;
    if (names.includes(v)) return toast.error('Esa comida ya está en la lista.');
    save([...names, v]);
    setDraft('');
  }

  return (
    <div className="mt-4 space-y-2">
      {names.map((n, i) => (
        <div key={n} className="flex gap-2">
          <input
            defaultValue={n}
            maxLength={30}
            onBlur={(e) => rename(i, e.target.value)}
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-[14px] outline-none focus:border-ok"
          />
          <button
            onClick={() => (names.length > 1 ? save(names.filter((_, j) => j !== i)) : toast.error('Deja al menos una comida.'))}
            aria-label={`Quitar ${n}`}
            className="grid size-11 place-items-center rounded-xl border text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={draft}
          maxLength={30}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Nueva comida"
          className="h-11 min-w-0 flex-1 rounded-xl border border-dashed border-input bg-background px-3 text-[14px] outline-none focus:border-ok"
        />
        <button onClick={add} aria-label="Agregar comida" className="grid size-11 place-items-center rounded-xl bg-ok text-background">
          <Plus className="size-5" />
        </button>
      </div>
      <button onClick={() => save(DEFAULT_MEALS)} className="text-[13px] font-semibold text-muted-foreground">
        Restablecer las 6 comidas
      </button>
    </div>
  );
}

function Tile({ value, label, icon, decimals = 0 }: { value: number; label: string; icon?: React.ReactNode; decimals?: number }) {
  return (
    <div className="grain rounded-2xl border bg-surface p-3.5">
      <p className="font-display tabular flex items-center gap-1 text-[32px] leading-none font-black">
        {icon}
        <NumberTicker value={value} decimalPlaces={decimals} className="text-foreground" />
      </p>
      <p className="mt-1.5 text-[12px] leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
