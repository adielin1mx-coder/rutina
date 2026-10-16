import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Copy, Flame, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import type { Exercise } from '@/data/rutina';
import { fst7Allowed, type Block } from '@/hooks/useBlock';
import { isoDate, shortDate } from '@/lib/date';
import { advise, bestE1rm, FST7_REPS, FST7_SETS, fmtWeight, type SetEntry, type Unit } from '@/lib/progression';
import { deleteSession, historyOf, saveSession, setFst7, setUnit, useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AdviceBox } from './AdviceBadge';
import { RestTimer } from './RestTimer';

type Row = { w: string; reps: string; rir: string };
const emptyRow = (w = ''): Row => ({ w, reps: '', rir: '' });

export function SetLogger({ ex, block, today, onClose }: { ex: Exercise | null; block: Block; today: Date; onClose: () => void }) {
  return (
    <Drawer open={!!ex} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="mx-auto max-h-[92dvh] w-full max-w-xl border-border bg-popover">
        {ex && <LoggerBody key={ex.id} ex={ex} block={block} today={today} onClose={onClose} />}
      </DrawerContent>
    </Drawer>
  );
}

function LoggerBody({ ex, block, today, onClose }: { ex: Exercise; block: Block; today: Date; onClose: () => void }) {
  const sessions = useStore((s) => s.sessions);
  const unitPref = useStore((s) => s.units[ex.id]);
  const fst7Pref = useStore((s) => !!s.fst7[ex.id]);
  const canFst7 = fst7Allowed(block, ex.id);
  const fst7 = canFst7 && fst7Pref;

  const history = useMemo(() => historyOf(sessions, ex.id), [sessions, ex.id]);
  const allHistory = useMemo(() => historyOf(sessions, ex.id, true), [sessions, ex.id]);
  const advice = advise(ex, history, block);
  const unit: Unit = unitPref ?? history[0]?.unit ?? 'kg';
  const date = isoDate(today);
  const existing = allHistory.find((s) => s.date === date && s.fst7 === fst7);

  const targetSets = fst7 ? FST7_SETS : block.deload ? Math.ceil(ex.sets / 2) : ex.sets;
  const [lo, hi] = fst7 ? FST7_REPS : ex.reps;

  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    if (existing) {
      setRows(existing.sets.map((s) => ({ w: String(s.w), reps: String(s.reps), rir: s.rir === undefined ? '' : String(s.rir) })));
      return;
    }
    const prev = allHistory.find((s) => s.fst7 === fst7);
    const w = !fst7 && advice.next !== undefined ? fmtWeight(advice.next) : prev ? fmtWeight(Math.max(...prev.sets.map((s) => s.w))) : '';
    setRows(Array.from({ length: targetSets }, () => emptyRow(w)));
    // Solo al abrir o al cambiar de modo FST-7
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fst7, existing?.id]);

  const placeholders = (allHistory.find((s) => s.fst7 === fst7)?.sets ?? []).map((s) => s.reps);
  const update = (i: number, key: keyof Row, value: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: value.replace(',', '.') } : row)));

  const valid = rows.filter((r) => Number(r.w) >= 0 && r.w !== '' && Number(r.reps) > 0);

  function save() {
    if (!valid.length) {
      toast.error('Anota al menos una serie con peso y reps.');
      return;
    }
    const sets: SetEntry[] = valid.map((r) => ({
      w: Number(r.w),
      reps: Math.round(Number(r.reps)),
      ...(r.rir !== '' ? { rir: Number(r.rir) } : {}),
    }));
    saveSession({
      id: existing?.id ?? `${date}-${ex.id}${fst7 ? '-fst7' : ''}-${Math.random().toString(36).slice(2, 7)}`,
      date,
      exerciseId: ex.id,
      unit,
      fst7,
      sets,
      ts: Date.now(),
    });
    const after = advise(ex, fst7 ? history : [{ id: 'tmp', date, exerciseId: ex.id, unit, fst7, sets, ts: 0 }, ...history.filter((h) => h.id !== existing?.id)], block);
    toast.success(existing ? 'Sesión actualizada' : 'Sesión guardada', { description: fst7 ? 'FST-7 registrado.' : `Próxima vez: ${after.title}` });
    onClose();
  }

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div>
          <DrawerTitle className="font-display text-[28px] leading-none font-black tracking-tight">{ex.name}</DrawerTitle>
          <DrawerDescription className="mt-1.5 text-left text-[13.5px]">
            {targetSets} × {lo}–{hi} · {fst7 ? '30–45 s de descanso' : block.deload ? 'Descarga: RIR 3–4, sin técnicas' : block.rampUp ? 'Arranque: RIR 1–2, sin técnicas' : ex.effort}
          </DrawerDescription>
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-muted-foreground hover:bg-surface-2">
          <X className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pt-4 pb-5">
        {!fst7 && <AdviceBox advice={advice} />}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-full border bg-surface p-1">
            {(['kg', 'lb'] as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnit(ex.id, u)}
                className={cn('relative rounded-full px-4 py-1.5 text-sm font-semibold transition-colors', unit === u ? 'text-white' : 'text-muted-foreground')}
              >
                {unit === u && <motion.span layoutId={`unit-${ex.id}`} className="absolute inset-0 rounded-full bg-neon" />}
                <span className="relative">{u}</span>
              </button>
            ))}
          </div>
          {canFst7 && (
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-warn">
              <Flame className="size-4" /> FST-7
              <Switch checked={fst7} onCheckedChange={(v) => setFst7(ex.id, v)} />
            </label>
          )}
        </div>

        <div>
          <div className="grid grid-cols-[3.2rem_1fr_1fr_4.2rem] gap-2 px-1 pb-1.5 text-[11.5px] font-semibold tracking-wide text-muted-foreground uppercase">
            <span>Serie</span>
            <span>Peso ({unit})</span>
            <span>Reps</span>
            <span>RIR</span>
          </div>
          <AnimatePresence initial={false}>
            {rows.map((r, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-[3.2rem_1fr_1fr_4.2rem] items-center gap-2 py-1"
              >
                <span className="font-display tabular text-2xl font-extrabold text-muted-foreground">{i + 1}</span>
                <NumInput value={r.w} onChange={(v) => update(i, 'w', v)} placeholder="0" decimal />
                <NumInput value={r.reps} onChange={(v) => update(i, 'reps', v)} placeholder={placeholders[i] ? String(placeholders[i]) : `${lo}–${hi}`} />
                <NumInput value={r.rir} onChange={(v) => update(i, 'rir', v)} placeholder="–" />
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="mt-2 flex flex-wrap gap-2">
            <SmallBtn onClick={() => setRows((r) => [...r, emptyRow(r.at(-1)?.w ?? '')])}>
              <Plus className="size-3.5" /> Serie
            </SmallBtn>
            {rows.length > 1 && (
              <SmallBtn onClick={() => setRows((r) => r.slice(0, -1))}>
                <Trash2 className="size-3.5" /> Quitar última
              </SmallBtn>
            )}
            <SmallBtn onClick={() => setRows((r) => r.map((row) => ({ ...row, w: r[0]?.w ?? '' })))}>
              <Copy className="size-3.5" /> Peso de la 1ª a todas
            </SmallBtn>
          </div>
        </div>

        <RestTimer presets={fst7 ? [30, 45] : ex.kind === 'isolation' ? [90, 120] : [120, 180]} />

        <button
          onClick={save}
          className="h-12 w-full rounded-xl bg-neon text-base font-bold text-white shadow-[0_10px_30px_-10px_var(--neon)] transition active:scale-[0.98]"
        >
          {existing ? 'Actualizar sesión de hoy' : 'Guardar sesión'}
        </button>

        {allHistory.length > 0 && (
          <div>
            <p className="mb-2 text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">Historial</p>
            <ul className="divide-y divide-border rounded-xl border bg-surface">
              {allHistory.slice(0, 6).map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                  <span className="w-14 shrink-0 text-muted-foreground">{shortDate(s.date)}</span>
                  <span className="tabular min-w-0 flex-1 truncate">
                    {s.sets.map((x) => `${fmtWeight(x.w)}×${x.reps}`).join('  ')} <span className="text-muted-foreground">{s.unit}</span>
                    {s.fst7 && <Flame className="ml-1 inline size-3.5 text-warn" />}
                  </span>
                  <span className="tabular hidden text-muted-foreground sm:inline">e1RM {fmtWeight(Math.round(bestE1rm(s)))}</span>
                  <button
                    aria-label="Borrar sesión"
                    onClick={() => {
                      deleteSession(s.id);
                      toast('Sesión borrada');
                    }}
                    className="rounded-full p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function NumInput({ value, onChange, placeholder, decimal }: { value: string; onChange: (v: string) => void; placeholder?: string; decimal?: boolean }) {
  return (
    <input
      type="text"
      inputMode={decimal ? 'decimal' : 'numeric'}
      enterKeyHint="next"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ''))}
      onFocus={(e) => e.target.select()}
      className="tabular h-12 w-full min-w-0 rounded-xl border border-input bg-surface px-3 text-center text-lg font-semibold outline-none placeholder:text-muted-foreground/50 focus:border-neon focus:ring-2 focus:ring-neon/30"
    />
  );
}

function SmallBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex h-8 items-center gap-1.5 rounded-full border bg-surface px-3 text-[13px] font-medium text-foreground/85 hover:border-neon/60">
      {children}
    </button>
  );
}
