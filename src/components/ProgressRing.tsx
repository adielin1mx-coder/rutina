import { useEffect, useRef } from 'react';
import { animate } from 'animejs';
import { prefersReducedMotion } from '@/hooks/useAnime';

/** Anillo de progreso SVG; el trazo se anima con anime.js al cambiar `value` (0–1). */
export function ProgressRing({
  value,
  size,
  stroke,
  color,
  track = 'rgb(255 255 255 / 0.08)',
  className,
  children,
}: {
  value: number;
  size: number;
  stroke: number;
  color: string;
  track?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arc = useRef<SVGCircleElement>(null);
  const last = useRef<number | null>(null);
  const target = c * (1 - Math.min(1, Math.max(0, value)));

  useEffect(() => {
    const el = arc.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.strokeDashoffset = String(target);
      return;
    }
    const a = animate(el, { strokeDashoffset: [last.current ?? c, target], duration: 900, ease: 'outExpo' });
    last.current = target;
    return () => void a.pause();
  }, [target, c]);

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          ref={arc}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
