'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, Horse, HealthMetric, Alert } from '@/lib/types';
import { loadState, saveState, addHorse, addHealthMetric, addAlert, updateAlertStatus } from '@/lib/store';
import { initialHorses, initialHealthMetrics, initialAlerts } from '@/lib/data';

const defaultState: AppState = { horses: initialHorses, healthMetrics: initialHealthMetrics, alerts: initialAlerts };

interface AppContextValue {
  state: AppState;
  addNewHorse: (horse: Omit<Horse, 'id' | 'createdAt' | 'updatedAt'>) => void;
  logHealthMetric: (metric: Omit<HealthMetric, 'id' | 'timestamp'>) => void;
  createAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) => void;
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Use default state for SSR; hydrate from localStorage after mount
  const [state, setState] = useState<AppState>(defaultState);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage only after client mount to avoid hydration mismatch
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      saveState(state);
    }
  }, [state, mounted]);

  const addNewHorse = useCallback((horse: Omit<Horse, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState((s) => addHorse(s, horse));
  }, []);

  const logHealthMetric = useCallback((metric: Omit<HealthMetric, 'id' | 'timestamp'>) => {
    setState((s) => addHealthMetric(s, metric));
  }, []);

  const createAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>) => {
    setState((s) => addAlert(s, alert));
  }, []);

  const acknowledgeAlert = useCallback((id: string) => {
    setState((s) => updateAlertStatus(s, id, 'acknowledged'));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setState((s) => updateAlertStatus(s, id, 'resolved'));
  }, []);

  return (
    <AppContext.Provider value={{ state, addNewHorse, logHealthMetric, createAlert, acknowledgeAlert, resolveAlert }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
