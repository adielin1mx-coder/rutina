import { CloudOff, Cloud, CloudAlert, Loader2, CloudUpload } from 'lucide-react';
import { useStore, type SyncStatus } from '@/lib/store';
import { cn } from '@/lib/utils';

const SYNC: Record<SyncStatus, { icon: typeof Cloud; text: string; cls: string }> = {
  off: { icon: CloudOff, text: 'Solo local', cls: 'text-muted-foreground' },
  idle: { icon: Cloud, text: 'Sincronizado', cls: 'text-ok' },
  syncing: { icon: Loader2, text: 'Sincronizando', cls: 'text-foreground [&>svg]:animate-spin' },
  pending: { icon: CloudUpload, text: 'Pendiente', cls: 'text-warn' },
  error: { icon: CloudAlert, text: 'Error de sync', cls: 'text-destructive' },
};

export function TopBar({ onSettings }: { onSettings: () => void }) {
  const status = useStore((s) => s.status);
  const pending = useStore((s) => s.pending.length + s.deleted.length);
  const { icon: Icon, text, cls } = SYNC[status];
  return (
    <header
      className="sticky top-0 z-30 border-b border-white/5 bg-background/75 backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-neon shadow-[0_0_20px_-2px_var(--neon)]">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <rect x="2" y="10" width="20" height="4" rx="1.5" fill="#fff" />
              <rect x="5" y="6" width="3.5" height="12" rx="1.2" fill="#fff" />
              <rect x="15.5" y="6" width="3.5" height="12" rx="1.2" fill="#fff" />
            </svg>
          </span>
          <span className="font-display text-[22px] font-black tracking-wide uppercase">Rutina</span>
        </div>
        <button onClick={onSettings} className={cn('inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1.5 text-[12.5px] font-semibold', cls)}>
          <Icon className="size-4" />
          {text}
          {pending > 0 && status !== 'off' && <span className="tabular">· {pending}</span>}
        </button>
      </div>
    </header>
  );
}
