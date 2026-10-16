import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { animate } from 'animejs';
import { Check } from 'lucide-react';
import { ProgressRing } from '@/components/ProgressRing';
import { dayFor, WEEK } from '@/data/schedule';
import { prefersReducedMotion } from '@/hooks/useAnime';
import { useHideOnScroll } from '@/hooks/useScrollDirection';
import { useReadyCount } from '@/hooks/useReadyCount';
import { typeOf, typeVars } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { DOCK_LEFT, DOCK_RIGHT, VIEWS, type ViewId } from './views';

const haptic = () => navigator.vibrate?.(8);

/**
 * Dock flotante con botón central: "Hoy" sobresale con el color del tipo de día y un anillo
 * con el avance de la sesión. Las demás pestañas comparten un indicador líquido.
 * Se esconde al bajar y vuelve al subir.
 */
export function BottomDock({ view, onChange, today, progress }: { view: ViewId; onChange: (v: ViewId) => void; today: Date; progress: number }) {
  const hidden = useHideOnScroll();
  const ready = useReadyCount();
  const wd = today.getDay();
  const day = dayFor(wd);
  const go = (v: ViewId) => {
    haptic();
    onChange(v);
  };

  return (
    <nav
      aria-label="Secciones"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', ...typeVars(day ? typeOf(day) : null) }}
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
        hidden && 'translate-y-[calc(100%+60px)]',
      )}
    >
      <div className="relative w-full max-w-md">
        {/* Cápsula de vidrio con borde degradado */}
        <div className="absolute inset-x-0 bottom-0 h-[68px] rounded-[28px] bg-gradient-to-b from-white/15 to-white/[0.03] p-px shadow-[0_24px_60px_-12px_rgb(0_0_0/0.9)]">
          <div className="size-full rounded-[27px] bg-[#111113]/85 backdrop-blur-2xl" />
        </div>

        <div className="relative grid h-[68px] grid-cols-5 items-center px-1.5">
          {DOCK_LEFT.map((id) => (
            <Tab key={id} id={id} active={view === id} onClick={() => go(id)} badge={id === 'progreso' ? ready : 0} />
          ))}
          <TodayButton active={view === 'hoy'} onClick={() => go('hoy')} letter={WEEK[wd].short} rest={!day} progress={progress} />
          {DOCK_RIGHT.map((id) => (
            <Tab key={id} id={id} active={view === id} onClick={() => go(id)} />
          ))}
        </div>
      </div>
    </nav>
  );
}

function Tab({ id, active, onClick, badge = 0 }: { id: ViewId; active: boolean; onClick: () => void; badge?: number }) {
  const { label, icon: Icon } = VIEWS.find((v) => v.id === id)!;
  const icon = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!active || !icon.current || prefersReducedMotion()) return;
    const a = animate(icon.current, { translateY: [0, -5, 0], scale: [1, 1.18, 1], duration: 520, ease: 'outElastic(1, .6)' });
    return () => void a.revert();
  }, [active]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      className="relative mx-auto flex h-[54px] w-full max-w-[76px] flex-col items-center justify-center rounded-[20px]"
    >
      {active && (
        <motion.span
          layoutId="dock-pill"
          className="absolute inset-0 rounded-[20px] bg-white/[0.07] ring-1 ring-white/10"
          transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.8 }}
        >
          <span className="absolute inset-x-5 -bottom-px h-[2px] rounded-full bg-(--c) shadow-[0_0_10px_var(--c)]" />
        </motion.span>
      )}
      <span ref={icon} className="relative">
        <Icon className={cn('size-[22px] transition-colors', active ? 'text-foreground' : 'text-muted-foreground')} strokeWidth={active ? 2.3 : 1.8} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 grid h-4 min-w-4 place-items-center rounded-full bg-ok px-1 text-[10px] font-black text-background shadow-[0_0_10px_var(--ok)]">
            {badge}
          </span>
        )}
      </span>
      <span
        className={cn(
          'relative mt-0.5 text-[10.5px] font-semibold transition-all duration-200',
          active ? 'text-foreground opacity-100' : 'h-0 opacity-0',
        )}
      >
        {label}
      </span>
    </button>
  );
}

function TodayButton({ active, onClick, letter, rest, progress }: { active: boolean; onClick: () => void; letter: string; rest: boolean; progress: number }) {
  const btn = useRef<HTMLButtonElement>(null);
  const complete = !rest && progress >= 1;
  useEffect(() => {
    if (!complete || !btn.current || prefersReducedMotion()) return;
    const a = animate(btn.current, { scale: [1, 1.12, 1], duration: 700, ease: 'outElastic(1, .5)' });
    return () => void a.revert();
  }, [complete]);

  return (
    <div className="relative flex justify-center">
      <button
        ref={btn}
        type="button"
        onClick={onClick}
        aria-current={active ? 'page' : undefined}
        aria-label={`Hoy${rest ? ' · descanso' : ` · ${Math.round(progress * 100)}% registrado`}`}
        className="relative -mt-9 rounded-full transition-transform active:scale-95"
      >
        <span className={cn('absolute inset-1 rounded-full blur-xl transition-opacity', rest ? 'bg-foreground/10' : 'bg-(--c)/50', active ? 'opacity-100' : 'opacity-50')} />
        <ProgressRing value={rest ? 0 : progress} size={72} stroke={4} color="var(--c)" track="rgb(255 255 255 / 0.12)" className="rounded-full bg-[#111113]">
          <span
            className={cn(
              'grid size-[58px] place-items-center rounded-full border transition-colors',
              rest ? 'border-white/10 bg-surface-2' : active ? 'border-transparent bg-(--c) text-(--c-ink)' : 'border-(--c)/40 bg-(--c)/15 text-(--c)',
            )}
          >
            <span className="flex flex-col items-center leading-none">
              {complete ? (
                <Check className="size-6" strokeWidth={3.5} />
              ) : (
                <span className={cn('font-display text-[26px] font-black', rest && 'text-muted-foreground')}>{letter}</span>
              )}
              <span className={cn('mt-0.5 text-[9.5px] font-bold tracking-wider uppercase', rest && 'text-muted-foreground')}>Hoy</span>
            </span>
          </span>
        </ProgressRing>
      </button>
    </div>
  );
}
