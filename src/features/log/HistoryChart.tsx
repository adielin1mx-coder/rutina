import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { shortDate } from '@/lib/date';
import { bestE1rm, workingWeight, type Session } from '@/lib/progression';

const config = {
  w: { label: 'Peso de trabajo', color: 'var(--neon)' },
  e: { label: 'e1RM (Epley)', color: 'var(--chart-3)' },
} satisfies ChartConfig;

/** Peso de trabajo y 1RM estimado por sesión (solo la unidad más reciente). */
export function HistoryChart({ history }: { history: Session[] }) {
  const unit = history[0]?.unit;
  const data = history
    .filter((s) => s.unit === unit)
    .slice(0, 16)
    .reverse()
    .map((s) => ({ d: shortDate(s.date), w: workingWeight(s), e: Math.round(bestE1rm(s) * 10) / 10 }));

  if (data.length < 2)
    return <p className="rounded-xl border border-dashed p-4 text-center text-[13.5px] text-muted-foreground">Con 2 sesiones registradas aparece tu gráfica.</p>;

  return (
    <ChartContainer config={config} className="aspect-auto h-48 w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="d" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
        <ChartTooltip content={<ChartTooltipContent formatter={(v, name) => `${config[name as 'w' | 'e'].label}: ${v} ${unit}`} />} />
        <Line dataKey="e" type="monotone" stroke="var(--color-e)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
        <Line dataKey="w" type="monotone" stroke="var(--color-w)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--color-w)' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ChartContainer>
  );
}
