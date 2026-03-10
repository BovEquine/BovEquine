import { AppState, Horse, HealthMetric, Alert } from './types';
import { initialHorses, initialHealthMetrics, initialAlerts } from './data';

const STORAGE_KEY = 'bovequine_state';

export function loadState(): AppState {
  if (typeof window === 'undefined') {
    return { horses: initialHorses, healthMetrics: initialHealthMetrics, alerts: initialAlerts };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { horses: initialHorses, healthMetrics: initialHealthMetrics, alerts: initialAlerts };
    return JSON.parse(raw) as AppState;
  } catch {
    return { horses: initialHorses, healthMetrics: initialHealthMetrics, alerts: initialAlerts };
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function addHorse(state: AppState, horse: Omit<Horse, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newHorse: Horse = {
    ...horse,
    id: `horse-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...state, horses: [...state.horses, newHorse] };
}

export function addHealthMetric(state: AppState, metric: Omit<HealthMetric, 'id' | 'timestamp'>): AppState {
  const newMetric: HealthMetric = {
    ...metric,
    id: `metric-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  // Update horse status based on assessment
  let updatedHorses = state.horses;
  if (metric.assessment) {
    updatedHorses = state.horses.map((h) =>
      h.id === metric.horseId
        ? { ...h, status: metric.assessment!.status, updatedAt: new Date().toISOString() }
        : h
    );
  }
  return { ...state, healthMetrics: [newMetric, ...state.healthMetrics], horses: updatedHorses };
}

export function addAlert(state: AppState, alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): AppState {
  const newAlert: Alert = {
    ...alert,
    id: `alert-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return { ...state, alerts: [newAlert, ...state.alerts] };
}

export function updateAlertStatus(state: AppState, alertId: string, status: Alert['status']): AppState {
  return {
    ...state,
    alerts: state.alerts.map((a) =>
      a.id === alertId ? { ...a, status, updatedAt: new Date().toISOString() } : a
    ),
  };
}
