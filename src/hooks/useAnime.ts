import { useEffect, useRef, type DependencyList } from 'react';

type Revertible = { revert: () => unknown } | void;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Corre una animación de anime.js sobre `ref.current` y la revierte al desmontar.
 * Con movimiento reducido no anima: el elemento queda en su estado final de CSS.
 */
export function useAnime<T extends HTMLElement>(run: (el: T) => Revertible, deps: DependencyList = []) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    const anim = run(ref.current);
    return () => {
      anim?.revert();
    };
  }, deps);
  return ref;
}
