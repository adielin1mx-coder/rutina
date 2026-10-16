import { motion } from 'motion/react';
import { WEEK, WEEK_ORDER } from '@/data/schedule';
import { cn } from '@/lib/utils';

/** Tira L–D: hoy con anillo neón, el seleccionado relleno. */
export function WeekStrip({ today, selected, onSelect }: { today: number; selected: number; onSelect: (wd: number) => void }) {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEK_ORDER.map((wd) => {
        const w = WEEK[wd];
        const rest = !w.day;
        const isSel = wd === selected;
        return (
          <button
            key={wd}
            onClick={() => onSelect(wd)}
            aria-pressed={isSel}
            className={cn(
              'relative flex min-h-[86px] flex-col rounded-xl border p-2 text-left transition-colors sm:min-h-[104px] sm:p-2.5',
              rest ? 'border-dashed bg-transparent' : 'bg-surface',
              wd === today && !isSel && 'border-neon/70',
            )}
          >
            {isSel && (
              <motion.span
                layoutId="week-sel"
                className="absolute inset-0 rounded-xl bg-neon shadow-[0_0_26px_-6px_var(--neon)]"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
              />
            )}
            <span className={cn('relative font-display text-[26px] leading-none font-black', isSel ? 'text-white' : rest && 'text-muted-foreground')}>
              {w.short}
            </span>
            {wd === today && <span className={cn('relative mt-1 text-[9.5px] font-bold tracking-wider uppercase', isSel ? 'text-white/90' : 'text-neon')}>Hoy</span>}
            <span className={cn('relative mt-auto text-[11px] leading-tight sm:text-[12.5px]', isSel ? 'text-white/90' : 'text-muted-foreground')}>{w.label}</span>
          </button>
        );
      })}
    </div>
  );
}
