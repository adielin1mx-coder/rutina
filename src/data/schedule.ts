import { DAYS, type Day, type DayId } from './rutina';

/** Índice de JS: 0 = domingo … 6 = sábado. */
export const WEEK: { short: string; name: string; slug: string; day: DayId | null; label: string; tag: string }[] = [
  { short: 'D', name: 'Domingo', slug: 'domingo', day: null, label: 'Descanso', tag: 'Descanso' },
  { short: 'L', name: 'Lunes', slug: 'lunes', day: 'empuje', label: 'Empuje', tag: 'Empuje' },
  { short: 'M', name: 'Martes', slug: 'martes', day: 'jalon', label: 'Jalón', tag: 'Jalón' },
  { short: 'X', name: 'Miércoles', slug: 'miercoles', day: 'pierna-hipertrofia', label: 'Pierna hipertrofia', tag: 'Pierna' },
  { short: 'J', name: 'Jueves', slug: 'jueves', day: 'torso', label: 'Torso fuerza', tag: 'Torso' },
  { short: 'V', name: 'Viernes', slug: 'viernes', day: 'pierna-fuerza', label: 'Pierna fuerza', tag: 'Pierna' },
  { short: 'S', name: 'Sábado', slug: 'sabado', day: null, label: 'Descanso', tag: 'Descanso' },
];

/** Orden de lunes a domingo para mostrar la semana. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const dayFor = (weekday: number): Day | null => {
  const id = WEEK[weekday].day;
  return id ? DAYS[id] : null;
};

/** Próximo día con entrenamiento a partir de mañana. */
export function nextSession(weekday: number): { weekday: number; day: Day; inDays: number } {
  for (let i = 1; i <= 7; i++) {
    const wd = (weekday + i) % 7;
    const day = dayFor(wd);
    if (day) return { weekday: wd, day, inDays: i };
  }
  throw new Error('Semana sin entrenamientos');
}

export const weekdayOf = (id: DayId) => WEEK.findIndex((w) => w.day === id);
