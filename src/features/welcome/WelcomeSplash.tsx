import { useCallback, useEffect, useRef } from 'react';
import { createTimeline, stagger } from 'animejs';
import { fraseDelDia } from '@/data/frases';
import { dayFor, WEEK } from '@/data/schedule';
import { prefersReducedMotion } from '@/hooks/useAnime';
import { TYPE_LABEL, typeOf, typeVars, usePrefs } from '@/lib/theme';

const SEEN_KEY = 'rutina.welcomed';

/** Se muestra una vez por sesión del navegador; `?bienvenida` la fuerza y `?vista`/`?registrar` la omiten. */
export function shouldWelcome() {
  const q = new URLSearchParams(window.location.search);
  if (q.has('bienvenida')) return true;
  if (q.has('vista') || q.has('registrar')) return false;
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* sin almacenamiento: se muestra */
  }
  return true;
}

const Letters = ({ text, className }: { text: string; className: string }) => (
  <>
    {[...text].map((ch, i) => (
      <span key={i} className={`${className} inline-block will-change-transform`}>
        {ch === ' ' ? ' ' : ch}
      </span>
    ))}
  </>
);

export function WelcomeSplash({ today, onDone }: { today: Date; onDone: () => void }) {
  const { name } = usePrefs();
  const root = useRef<HTMLDivElement>(null);
  const leaving = useRef(false);
  const finished = useRef(false);
  const wd = today.getDay();
  const day = dayFor(wd);
  const type = day ? typeOf(day) : null;
  const frase = fraseDelDia(today, type ?? 'rest');
  const reduced = prefersReducedMotion();

  const leave = useCallback(() => {
    const el = root.current;
    if (!el || leaving.current) return;
    leaving.current = true;
    // Salida solo con opacity/transform (compositor) y sin filtros vivos: no se traba.
    el.querySelectorAll<HTMLElement>('.w-hi, .w-name').forEach((n) => {
      n.style.filter = 'none';
      n.style.willChange = 'auto';
    });
    el.style.pointerEvents = 'none';
    el.style.willChange = 'opacity, transform';
    const ms = reduced ? 300 : 500;
    el.style.transition = `opacity ${ms}ms cubic-bezier(0.5, 0, 0.75, 0), transform ${ms}ms cubic-bezier(0.5, 0, 0.75, 0)`;
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      onDone();
    };
    el.addEventListener('transitionend', (e) => e.target === el && e.propertyName === 'opacity' && end());
    setTimeout(end, ms + 150);
    requestAnimationFrame(() => {
      el.style.opacity = '0';
      if (!reduced) el.style.transform = 'translate3d(0, -4%, 0)';
    });
  }, [onDone, reduced]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (reduced) {
      const t = setTimeout(leave, 1800);
      return () => clearTimeout(t);
    }
    const q = (s: string) => el.querySelectorAll<HTMLElement>(s);
    const tl = createTimeline({
      onComplete: () => {
        finished.current = true;
        // Quita el blur de las letras ya animadas: un filtro activo en cada letra encarece cada frame.
        q('.w-hi, .w-name').forEach((n) => {
          n.style.filter = 'none';
          n.style.willChange = 'auto';
        });
        setTimeout(leave, 900);
      },
    })
      .add(q('.w-hi'), { opacity: [0, 1], translateY: ['0.5em', '0em'], filter: ['blur(8px)', 'blur(0px)'], delay: stagger(28), duration: 600, ease: 'outExpo' })
      .add(
        q('.w-name'),
        { opacity: [0, 1], translateY: ['0.45em', '0em'], scale: [1.25, 1], filter: ['blur(14px)', 'blur(0px)'], delay: stagger(70), duration: 800, ease: 'outExpo' },
        '-=380',
      )
      .add(q('.w-sweep'), { scaleX: [0, 1], opacity: [1, 0.35], duration: 700, ease: 'inOutQuart' }, '-=500')
      .add(q('.w-meta'), { opacity: [0, 1], translateY: [14, 0], delay: stagger(110), duration: 600, ease: 'outCubic' }, '-=450');
    return () => {
      // Si ya terminó, revertir devolvería todo a opacity 0 justo antes de desmontar (parpadeo).
      if (finished.current || leaving.current) tl.pause();
      else tl.revert();
    };
  }, [leave, reduced]);

  const hidden = reduced ? '' : 'opacity-0';

  return (
    <div
      ref={root}
      role="dialog"
      aria-label={`Bienvenido, ${name}`}
      onClick={leave}
      style={typeVars(type)}
      className="fixed inset-0 z-[60] flex cursor-pointer flex-col justify-center overflow-hidden bg-background px-6"
    >
      {/* Degradados en lugar de blur-3xl: mismo halo sin un filtro que recalcular en cada frame de la salida. */}
      <div
        className="pointer-events-none absolute -top-56 -right-56 size-[40rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--c) 15%, transparent), transparent)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-64 -left-56 size-[38rem] rounded-full"
        style={{ background: 'radial-gradient(closest-side, color-mix(in oklab, var(--c) 10%, transparent), transparent)' }}
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <p className="font-display text-[clamp(40px,11vw,76px)] leading-none font-black text-foreground/80 uppercase">
          <Letters text="Bienvenido," className={`w-hi ${hidden}`} />
        </p>
        <p className="font-display text-glow mt-1 text-[clamp(96px,30vw,200px)] leading-[0.8] font-black text-(--c) uppercase">
          <Letters text={name} className={`w-name ${hidden}`} />
        </p>

        <div className={`w-sweep mt-6 h-[2px] origin-left bg-(--c) shadow-[0_0_18px_var(--c)] ${reduced ? '' : 'scale-x-0'}`} />

        <div className={`w-meta mt-5 flex flex-wrap items-center gap-2 ${hidden}`}>
          {type && (
            <span className="rounded-md bg-(--c) px-2 py-0.5 text-[12px] font-black tracking-wider text-(--c-ink) uppercase">{TYPE_LABEL[type].long}</span>
          )}
          <span className="font-display text-[28px] leading-none font-black uppercase">
            {WEEK[wd].name} · {day ? day.title : 'Descanso'}
          </span>
        </div>
        <p className={`w-meta mt-3 max-w-[34ch] text-[17px] leading-snug text-foreground/75 ${hidden}`}>{frase}</p>
        <p className={`w-meta mt-10 text-[12px] tracking-[0.2em] text-muted-foreground uppercase ${hidden}`}>Toca para entrar</p>
      </div>
    </div>
  );
}
