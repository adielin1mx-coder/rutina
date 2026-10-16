import { AnimatedBackground } from '@/components/ui/animated-background';
import { cn } from '@/lib/utils';
import { VIEWS, type ViewId } from './views';

/** Dock flotante inferior: navegación principal pensada para el pulgar. */
export function BottomDock({ view, onChange }: { view: ViewId; onChange: (v: ViewId) => void }) {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' }}
    >
      <div className="flex w-full max-w-md items-center justify-between rounded-full border border-white/10 bg-[#141416]/80 p-1.5 shadow-[0_20px_50px_-10px_rgb(0_0_0/0.8)] backdrop-blur-xl">
        <AnimatedBackground
          defaultValue={view}
          onValueChange={(id) => id && onChange(id as ViewId)}
          className="rounded-full bg-neon shadow-[0_0_24px_-4px_var(--neon)]"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.45 }}
        >
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              data-id={id}
              type="button"
              aria-current={view === id ? 'page' : undefined}
              className={cn(
                'flex-1 justify-center rounded-full py-2 transition-colors',
                view === id ? 'text-white' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span className="flex flex-col items-center gap-0.5 px-1">
                <Icon className="size-5" />
                <span className="text-[10.5px] font-semibold">{label}</span>
              </span>
            </button>
          ))}
        </AnimatedBackground>
      </div>
    </nav>
  );
}
