import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { shortDate } from '@/lib/date';
import { fmtWeight, type WeightTrend } from '@/lib/progression';
import { cn } from '@/lib/utils';

const signed = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : '±'}${fmtWeight(Math.abs(x))}`;

/** Peso que cargas ahora, cuánto ha subido desde el inicio y una mini gráfica de las últimas sesiones. */
export function CurrentWeight({ trend, color = 'var(--neon)', reps, compact }: { trend: WeightTrend; color?: string; reps?: number[]; compact?: boolean }) {
  const Icon = trend.delta > 0 ? ArrowUpRight : trend.delta < 0 ? ArrowDownRight : Minus;
  const tone = trend.delta > 0 ? 'text-ok' : trend.delta < 0 ? 'text-warn' : 'text-muted-foreground';

  if (compact)
    return (
      <span className="flex items-baseline gap-2">
        <span className="font-display tabular text-[22px] leading-none font-black">
          {fmtWeight(trend.current)}
          <span className="ml-0.5 text-[13px] text-muted-foreground">{trend.unit}</span>
        </span>
        {trend.sessions > 1 && (
          <span className={cn('tabular inline-flex items-center text-[12.5px] font-semibold', tone)}>
            <Icon className="size-3.5" />
            {signed(trend.delta)}
          </span>
        )}
        {reps && <span className="tabular truncate text-[12.5px] text-muted-foreground">× {reps.join('/')}</span>}
      </span>
    );

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-surface-2/60 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">Peso actual</p>
        <p className="font-display tabular mt-0.5 text-[34px] leading-none font-black" style={{ color }}>
          {fmtWeight(trend.current)}
          <span className="ml-1 text-[16px] text-muted-foreground">{trend.unit}</span>
        </p>
        <p className="tabular mt-1 truncate text-[12.5px] text-muted-foreground">
          {reps && <>× {reps.join('/')} · </>}
          {shortDate(trend.date)}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {trend.points.length > 1 && <Sparkline points={trend.points} color={color} />}
        {trend.sessions > 1 ? (
          <p className={cn('tabular inline-flex items-center gap-0.5 text-[12.5px] font-semibold', tone)}>
            <Icon className="size-3.5" />
            {signed(trend.delta)} {trend.unit} desde el inicio
          </p>
        ) : (
          <p className="text-[12px] text-muted-foreground">Primera sesión</p>
        )}
      </div>
    </div>
  );
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 96;
  const h = 30;
  const min = Math.min(...points);
  const range = Math.max(...points) - min || 1;
  const xy = points.map((p, i) => [(i / (points.length - 1)) * (w - 6) + 3, h - 3 - ((p - min) / range) * (h - 6)]);
  const d = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [lx, ly] = xy.at(-1)!;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.85} />
      <circle cx={lx} cy={ly} r={3} fill={color} />
    </svg>
  );
}
