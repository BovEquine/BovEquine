export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type Gender = 'male' | 'female';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'new' | 'acknowledged' | 'resolved';

export interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  weight: number;
  gender: Gender;
  status: HealthStatus;
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetric {
  id: string;
  horseId: string;
  horseName: string;
  temperature: number; // °F
  heartRate: number; // bpm
  respiratoryRate: number; // breaths/min
  weight: number; // lbs
  notes?: string;
  timestamp: string;
  assessment?: HealthAssessment;
}

export interface HealthAssessment {
  score: number; // 0-100
  status: HealthStatus;
  findings: string[];
  recommendations: string[];
}

export interface Alert {
  id: string;
  horseId: string;
  horseName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  horses: Horse[];
  healthMetrics: HealthMetric[];
  alerts: Alert[];
}
