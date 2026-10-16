import { BookOpen, CalendarDays, Flame, LineChart, Settings } from 'lucide-react';

export const VIEWS = [
  { id: 'hoy', label: 'Hoy', icon: Flame },
  { id: 'semana', label: 'Semana', icon: CalendarDays },
  { id: 'progreso', label: 'Progreso', icon: LineChart },
  { id: 'guia', label: 'Guía', icon: BookOpen },
  { id: 'ajustes', label: 'Ajustes', icon: Settings },
] as const;

export type ViewId = (typeof VIEWS)[number]['id'];
