import { ArrowDownRight, ArrowUpRight, BatteryCharging, Equal, Sparkles } from 'lucide-react';
import type { Advice } from '@/lib/progression';
import { cn } from '@/lib/utils';

const STYLE = {
  up: { icon: ArrowUpRight, cls: 'border-ok/40 bg-ok/10 text-ok' },
  hold: { icon: Equal, cls: 'border-border bg-surface-2 text-foreground/80' },
  down: { icon: ArrowDownRight, cls: 'border-warn/40 bg-warn/10 text-warn' },
  deload: { icon: BatteryCharging, cls: 'border-warn/40 bg-warn/10 text-warn' },
  first: { icon: Sparkles, cls: 'border-border bg-surface-2 text-muted-foreground' },
} as const;

export function AdviceBadge({ advice, className }: { advice: Advice; className?: string }) {
  const { icon: Icon, cls } = STYLE[advice.verdict];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-semibold', cls, className)}>
      <Icon className="size-3.5" />
      {advice.title}
    </span>
  );
}

export function AdviceBox({ advice }: { advice: Advice }) {
  const { icon: Icon, cls } = STYLE[advice.verdict];
  return (
    <div className={cn('flex gap-3 rounded-xl border p-3', cls)}>
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>
        <p className="font-semibold">{advice.title}</p>
        <p className="mt-0.5 text-[13.5px] leading-snug text-foreground/75">{advice.detail}</p>
      </div>
    </div>
  );
}
