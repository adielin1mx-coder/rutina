import type { DayType } from '@/lib/theme';

/** Una frase propia de cada día de la semana (índice JS: 0 = domingo). */
const POR_DIA: Record<number, string> = {
  0: 'Domingo de recarga: descansa, duerme y llega con todo al lunes.',
  1: 'Lunes de empuje: el pecho se construye serie a serie.',
  2: 'Martes de jalón: espalda ancha, codos atrás y control en la bajada.',
  3: 'Miércoles de pierna: el volumen de hoy es el músculo de mañana.',
  4: 'Jueves pesado: técnica limpia, nada al fallo y que la barra suba.',
  5: 'Viernes de fuerza: piernas firmes, espalda neutra y a mover hierro.',
  6: 'Sábado de descanso: el crecimiento también se entrena durmiendo.',
};

const POR_TIPO: Record<DayType | 'rest', string[]> = {
  hyp: [
    'Hoy cuenta el volumen: cada rep cerca del fallo suma.',
    'Estira, aprieta, controla. La tensión es la que construye.',
    'Una rep más que la semana pasada. Así se crece.',
    'Rango completo y bombeo: hoy se esculpe.',
    'Concéntrate en el músculo, no en el peso.',
    'Series de calidad, descansos medidos. A trabajar.',
  ],
  str: [
    'Día pesado: calienta bien y que cada rep sea perfecta.',
    'La fuerza de hoy es el volumen que moverás mañana.',
    'Respira, aprieta el core y empuja.',
    'Pocas reps, mucha intención.',
    'Hoy toca romper tu marca, no tu técnica.',
    'Barra cargada, mente tranquila.',
  ],
  rest: [
    'Recupera: 7–9 horas de sueño y mañana se vuelve más fuerte.',
    'El músculo crece cuando descansas. Hoy también cuenta.',
    'Camina, estírate y prepárate para la próxima sesión.',
  ],
};

/** Frase del día: alterna entre la propia del día y una del tipo, estable durante toda la fecha. */
export function fraseDelDia(date: Date, type: DayType | 'rest'): string {
  const seed = date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  const pool = [POR_DIA[date.getDay()], ...POR_TIPO[type]];
  return pool[seed % pool.length];
}
