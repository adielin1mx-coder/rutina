import { useEffect, useState } from 'react';

/** `true` mientras se hace scroll hacia abajo (para esconder el dock); se muestra al subir o cerca del final. */
export function useHideOnScroll(threshold = 8) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const nearEnd = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
        if (y < 80 || nearEnd) setHidden(false);
        else if (Math.abs(y - last) > threshold) setHidden(y > last);
        last = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [threshold]);
  return hidden;
}
