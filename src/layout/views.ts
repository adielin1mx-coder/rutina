import { BookOpen, CalendarDays, Flame, LineChart, Settings, Utensils } from 'lucide-react';

export const VIEWS = [
  { id: 'hoy', label: 'Hoy', icon: Flame },
  { id: 'semana', label: 'Semana', icon: CalendarDays },
  { id: 'progreso', label: 'Progreso', icon: LineChart },
  { id: 'comidas', label: 'Comidas', icon: Utensils },
  { id: 'guia', label: 'Guía', icon: BookOpen },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
] as const;

export type ViewId = (typeof VIEWS)[number]['id'];

/** Pestañas a cada lado del botón central "Hoy". Ajustes vive en la barra superior. */
export const DOCK_LEFT: ViewId[] = ['semana', 'progreso'];
export const DOCK_RIGHT: ViewId[] = ['comidas', 'guia'];
