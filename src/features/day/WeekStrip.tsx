import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { animate, stagger } from 'animejs';
import { dayFor, WEEK, WEEK_ORDER } from '@/data/schedule';
import { prefersReducedMotion, useAnime } from '@/hooks/useAnime';
import { TYPE_LABEL, typeOf, typeVars } from '@/lib/theme';
import { cn } from '@/lib/utils';

/**
 * Tira L–D. Cada día lleva el color de su tipo (hipertrofia o fuerza): píldora y barra inferior.
 * El seleccionado se rellena con ese color y hoy late con un anillo.
 */
export function WeekStrip({ today, selected, onSelect }: { today: number; selected: number; onSelect: (wd: number) => void }) {
  const grid = useAnime<HTMLDivElement>((el) =>
    animate(el.children, {
      opacity: [0, 1],
      translateY: [14, 0],
      scale: [0.92, 1],
      delay: stagger(45),
      duration: 650,
      ease: 'outExpo',
    }),
  );
  const ring = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!ring.current || prefersReducedMotion()) return;
    const a = animate(ring.current, { opacity: [0.95, 0.25], scale: [1, 1.07], duration: 1300, loop: true, alternate: true, ease: 'inOutSine' });
    return () => void a.revert();
  }, [today, selected]);

  const sel = WEEK[selected];
  const selDay = dayFor(selected);

  return (
    <div>
      <div ref={grid} className="grid grid-cols-7 gap-1.5">
        {WEEK_ORDER.map((wd) => {
          const w = WEEK[wd];
          const day = dayFor(wd);
          const type = day ? typeOf(day) : null;
          const isSel = wd === selected;
          const isToday = wd === today;
          return (
            <button
              key={wd}
              onClick={() => onSelect(wd)}
              aria-pressed={isSel}
              aria-label={`${w.name} · ${w.label}`}
              style={typeVars(type)}
              className={cn(
                'relative flex min-h-[82px] min-w-0 flex-col items-start overflow-hidden rounded-xl border p-1.5 text-left transition-colors sm:min-h-[104px] sm:p-2.5',
                type ? 'bg-surface' : 'border-dashed bg-transparent',
              )}
            >
              {isToday && !isSel && <span ref={ring} className="pointer-events-none absolute inset-0 rounded-xl border-2 border-(--c)" />}
              {isSel && (
                <motion.span
                  layoutId="week-sel"
                  className={cn('absolute inset-0 rounded-xl', type ? 'bg-(--c) shadow-[0_0_26px_-6px_var(--c)]' : 'bg-surface-2')}
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
                />
              )}
              <span
                className={cn(
                  'relative font-display text-[24px] leading-none font-black sm:text-[26px]',
                  isSel && type ? 'text-(--c-ink)' : !type && 'text-muted-foreground',
                )}
              >
                {w.short}
              </span>
              {isToday && (
                <span className={cn('relative mt-0.5 text-[9px] font-bold tracking-wider uppercase sm:text-[9.5px]', isSel && type ? 'text-(--c-ink)/90' : 'text-(--c)')}>
                  Hoy
                </span>
              )}
              <span className="relative mt-auto w-full">
                {type && (
                  <span
                    className={cn(
                      'inline-block rounded-[5px] px-1 py-px text-[8.5px] leading-tight font-black tracking-wider sm:text-[9.5px]',
                      isSel ? 'bg-(--c-ink)/15 text-(--c-ink)' : 'bg-(--c)/15 text-(--c)',
                    )}
                  >
                    {TYPE_LABEL[type].tag}
                  </span>
                )}
                <span
                  className={cn(
                    'mt-1 hidden text-[12px] leading-tight break-words hyphens-auto sm:block',
                    isSel && type ? 'text-(--c-ink)/90' : 'text-muted-foreground',
                  )}
                  lang="es"
                >
                  {w.tag}
                </span>
              </span>
              {type && !isSel && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-(--c)" />}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground sm:hidden" style={typeVars(selDay ? typeOf(selDay) : null)}>
        <b className="text-foreground">{sel.name}</b> · {selDay ? selDay.title : sel.label}
        {selDay && <span className="font-semibold text-(--c)"> · {TYPE_LABEL[typeOf(selDay)].long}</span>}
      </p>
    </div>
  );
}
