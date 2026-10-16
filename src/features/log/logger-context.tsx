import { createContext, useContext } from 'react';
import type { Exercise } from '@/data/rutina';

export interface LoggerApi {
  open: (exercise: Exercise) => void;
}

export const LoggerContext = createContext<LoggerApi>({ open: () => {} });
export const useLogger = () => useContext(LoggerContext);
