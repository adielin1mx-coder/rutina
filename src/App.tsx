import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Toaster } from '@/components/ui/sonner';
import { exerciseById } from '@/data/catalog';
import type { Exercise } from '@/data/rutina';
import { WeekView } from '@/features/day/WeekView';
import { GuideView } from '@/features/guide/GuideView';
import { LoggerContext } from '@/features/log/logger-context';
import { SetLogger } from '@/features/log/SetLogger';
import { SettingsView } from '@/features/settings/SettingsView';
import { TodayView } from '@/features/today/TodayView';
import { MealsView } from '@/features/meals/MealsView';
import { dayFor } from '@/data/schedule';
import { isoDate } from '@/lib/date';
import { useStore } from '@/lib/store';
import { shouldWelcome, WelcomeSplash } from '@/features/welcome/WelcomeSplash';
import { useBlock } from '@/hooks/useBlock';
import { useToday } from '@/hooks/useToday';
import { BottomDock } from '@/layout/BottomDock';
import { TopBar } from '@/layout/TopBar';
import { VIEWS, type ViewId } from '@/layout/views';

// Recharts pesa: la vista de progreso se descarga solo al abrirla.
const ProgressView = lazy(() => import('@/features/log/ProgressView').then((m) => ({ default: m.ProgressView })));

// Se decide una sola vez al cargar (fuera de React para que StrictMode no lo consuma dos veces).
const WELCOME = shouldWelcome();

const VIEW_KEY = 'rutina.view';
const readView = (): ViewId => {
  const forced = new URLSearchParams(window.location.search).get('vista');
  if (forced && VIEWS.some((v) => v.id === forced)) return forced as ViewId;
  try {
    return (sessionStorage.getItem(VIEW_KEY) as ViewId) || 'hoy';
  } catch {
    return 'hoy';
  }
};

export default function App() {
  const today = useToday();
  const block = useBlock(today);
  const [view, setViewState] = useState<ViewId>(readView);
  const [selectedDay, setSelectedDay] = useState(() => today.getDay());
  // `?registrar=<id>` abre directamente el registrador de un ejercicio.
  const [logging, setLogging] = useState<Exercise | null>(
    () => exerciseById(new URLSearchParams(window.location.search).get('registrar') ?? '') ?? null,
  );

  const setView = useCallback((v: ViewId) => {
    setViewState(v);
    try {
      sessionStorage.setItem(VIEW_KEY, v);
    } catch {
      /* sin almacenamiento */
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const openDay = useCallback(
    (wd: number) => {
      setSelectedDay(wd);
      setView('semana');
    },
    [setView],
  );

  const [welcome, setWelcome] = useState(WELCOME);
  const endWelcome = useCallback(() => setWelcome(false), []);

  // Avance de la sesión de hoy para el anillo del dock.
  const sessions = useStore((s) => s.sessions);
  const progress = useMemo(() => {
    const day = dayFor(today.getDay());
    if (!day) return 0;
    const date = isoDate(today);
    const logged = new Set(Object.values(sessions).filter((x) => x.date === date).map((x) => x.exerciseId));
    return day.exercises.filter((e) => logged.has(e.id)).length / day.exercises.length;
  }, [sessions, today]);

  const logger = useMemo(() => ({ open: setLogging }), []);

  return (
    <LoggerContext.Provider value={logger}>
      <TopBar onSettings={() => setView('ajustes')} settingsActive={view === 'ajustes'} />
      <main className="pb-safe mx-auto max-w-3xl px-4 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'hoy' && <TodayView today={today} block={block} onOpenDay={openDay} onMeals={() => setView('comidas')} />}
            {view === 'semana' && <WeekView now={today} selected={selectedDay} onSelect={setSelectedDay} block={block} />}
            {view === 'progreso' && (
              <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-surface" />}>
                <ProgressView block={block} today={today} />
              </Suspense>
            )}
            {view === 'comidas' && <MealsView today={today} />}
            {view === 'guia' && <GuideView />}
            {view === 'ajustes' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomDock view={view} onChange={setView} today={today} progress={progress} />
      <SetLogger ex={logging} block={block} today={today} onClose={() => setLogging(null)} />
      <Toaster />
      {welcome && <WelcomeSplash today={today} onDone={endWelcome} />}
    </LoggerContext.Provider>
  );
}
