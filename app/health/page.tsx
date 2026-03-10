'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import HealthMetricCard from '@/components/HealthMetricCard';
import StatusBadge from '@/components/StatusBadge';
import { assessHealth } from '@/lib/aiAssessment';
import { HealthAssessment, HealthMetric } from '@/lib/types';
import { formatDateTime } from '@/lib/dateUtils';

interface FormState {
  horseId: string;
  temperature: string;
  heartRate: string;
  respiratoryRate: string;
  weight: string;
  notes: string;
}

const defaultForm: FormState = {
  horseId: '',
  temperature: '',
  heartRate: '',
  respiratoryRate: '',
  weight: '',
  notes: '',
};

function getVitalStatus(value: number, min: number, max: number): 'normal' | 'warning' | 'critical' {
  if (value >= min && value <= max) return 'normal';
  const range = max - min;
  const deviation = value < min ? min - value : value - max;
  if (deviation <= range * 0.35) return 'warning';
  return 'critical';
}

export default function HealthPage() {
  const { state, logHealthMetric, createAlert } = useApp();
  const { horses, healthMetrics } = state;
  const [form, setForm] = useState<FormState>(defaultForm);
  const [assessment, setAssessment] = useState<HealthAssessment | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const selectedHorse = horses.find((h) => h.id === form.horseId);
  const previousMetric = form.horseId
    ? healthMetrics
        .filter((m) => m.horseId === form.horseId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    : undefined;

  const handleAssess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.horseId || !form.temperature || !form.heartRate || !form.respiratoryRate || !form.weight) return;

    setSubmitting(true);
    setTimeout(() => {
      const result = assessHealth({
        temperature: parseFloat(form.temperature),
        heartRate: parseFloat(form.heartRate),
        respiratoryRate: parseFloat(form.respiratoryRate),
        weight: parseFloat(form.weight),
        previousWeight: previousMetric?.weight,
      });
      setAssessment(result);
      setSubmitting(false);
    }, 600);
  };

  const handleSave = () => {
    if (!assessment || !form.horseId || !selectedHorse) return;

    const metric: Omit<HealthMetric, 'id' | 'timestamp'> = {
      horseId: form.horseId,
      horseName: selectedHorse.name,
      temperature: parseFloat(form.temperature),
      heartRate: parseFloat(form.heartRate),
      respiratoryRate: parseFloat(form.respiratoryRate),
      weight: parseFloat(form.weight),
      notes: form.notes || undefined,
      assessment,
    };
    logHealthMetric(metric);

    // Auto-create alerts for warning/critical
    if (assessment.status !== 'healthy') {
      createAlert({
        horseId: form.horseId,
        horseName: selectedHorse.name,
        severity: assessment.status === 'critical' ? 'critical' : 'warning',
        status: 'new',
        title: `${assessment.status === 'critical' ? 'Critical' : 'Warning'}: Health Assessment for ${selectedHorse.name}`,
        message: assessment.findings.join('. '),
      });
    }

    setForm(defaultForm);
    setAssessment(null);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const tempVal = parseFloat(form.temperature);
  const hrVal = parseFloat(form.heartRate);
  const rrVal = parseFloat(form.respiratoryRate);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Health Monitoring</h1>
        <p className="text-stone-500 mt-1">Log vital signs and get AI-powered health assessments</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-green-500 text-xl">✅</span>
          <p className="text-green-700 font-medium">Health metrics saved successfully!</p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-stone-800 mb-5">📋 Record Vital Signs</h2>
          <form onSubmit={handleAssess} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Select Horse *</label>
              <select
                required
                value={form.horseId}
                onChange={(e) => { setForm({ ...form, horseId: e.target.value }); setAssessment(null); }}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose a horse --</option>
                {horses.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} ({h.breed})</option>
                ))}
              </select>
            </div>

            {selectedHorse && (
              <div className="bg-amber-50 rounded-lg p-3 flex items-center gap-3">
                <span className="text-2xl">🐴</span>
                <div>
                  <p className="font-semibold text-stone-800">{selectedHorse.name}</p>
                  <p className="text-xs text-stone-500">{selectedHorse.breed} · {selectedHorse.age} yrs · {selectedHorse.weight} lbs</p>
                </div>
                <StatusBadge status={selectedHorse.status} size="sm" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Temperature (°F) *
                  <span className="text-xs text-stone-400 ml-1">Normal: 99–101°F</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={90}
                  max={115}
                  required
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="100.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Heart Rate (bpm) *
                  <span className="text-xs text-stone-400 ml-1">Normal: 28–44</span>
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  required
                  value={form.heartRate}
                  onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="36"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Respiratory Rate *
                  <span className="text-xs text-stone-400 ml-1">Normal: 8–16/min</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  required
                  value={form.respiratoryRate}
                  onChange={(e) => setForm({ ...form, respiratoryRate: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Weight (lbs) *
                  {previousMetric && <span className="text-xs text-stone-400 ml-1">Prev: {previousMetric.weight} lbs</span>}
                </label>
                <input
                  type="number"
                  min={100}
                  max={3000}
                  required
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                placeholder="Any observations or symptoms..."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin text-lg">⚙️</span>
                  Analyzing with AI...
                </>
              ) : (
                <>🤖 Run AI Assessment</>
              )}
            </button>
          </form>

          {/* Live Metric Preview */}
          {form.temperature && form.heartRate && form.respiratoryRate && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-stone-600 mb-3">Live Vital Preview</h3>
              <div className="grid grid-cols-3 gap-3">
                <HealthMetricCard
                  label="Temperature"
                  value={form.temperature}
                  unit="°F"
                  icon="🌡️"
                  normalRange="99–101°F"
                  status={!isNaN(tempVal) ? getVitalStatus(tempVal, 99, 101) : 'normal'}
                />
                <HealthMetricCard
                  label="Heart Rate"
                  value={form.heartRate}
                  unit="bpm"
                  icon="❤️"
                  normalRange="28–44 bpm"
                  status={!isNaN(hrVal) ? getVitalStatus(hrVal, 28, 44) : 'normal'}
                />
                <HealthMetricCard
                  label="Resp. Rate"
                  value={form.respiratoryRate}
                  unit="/min"
                  icon="💨"
                  normalRange="8–16/min"
                  status={!isNaN(rrVal) ? getVitalStatus(rrVal, 8, 16) : 'normal'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Assessment Results */}
        <div>
          {!assessment ? (
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 flex flex-col items-center justify-center h-64 text-center">
              <span className="text-5xl mb-4">🤖</span>
              <h3 className="text-lg font-semibold text-stone-700">AI Assessment Ready</h3>
              <p className="text-stone-400 text-sm mt-2">Fill in the vital signs form and click "Run AI Assessment" to get an analysis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score Card */}
              <div className={`rounded-xl border p-6 ${
                assessment.status === 'healthy' ? 'bg-green-50 border-green-200' :
                assessment.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">AI Health Assessment</h2>
                    {selectedHorse && <p className="text-stone-500 text-sm">{selectedHorse.name}</p>}
                  </div>
                  <StatusBadge status={assessment.status} size="lg" />
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className={`text-5xl font-bold ${
                    assessment.status === 'healthy' ? 'text-green-600' :
                    assessment.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                  }`}>{assessment.score}</div>
                  <div>
                    <p className="text-sm text-stone-500">Health Score</p>
                    <p className="text-xs text-stone-400">out of 100</p>
                  </div>
                </div>
                <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      assessment.status === 'healthy' ? 'bg-green-500' :
                      assessment.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${assessment.score}%` }}
                  />
                </div>
              </div>

              {/* Findings */}
              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <h3 className="font-semibold text-stone-800 mb-3">🔍 Findings</h3>
                <ul className="space-y-2">
                  {assessment.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className="text-stone-400 mt-0.5">•</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div className="bg-white rounded-xl border border-stone-200 p-5">
                <h3 className="font-semibold text-stone-800 mb-3">💡 Recommendations</h3>
                <ul className="space-y-2">
                  {assessment.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
                      <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs mt-0.5 ${
                        assessment.status === 'critical' ? 'bg-red-500' :
                        assessment.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'
                      }`}>{i + 1}</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                💾 Save Assessment
              </button>
            </div>
          )}

          {/* Recent Records */}
          {form.horseId && (
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-stone-200">
              <div className="p-4 border-b border-stone-100">
                <h3 className="font-semibold text-stone-800">📅 Recent Records {selectedHorse ? `for ${selectedHorse.name}` : ''}</h3>
              </div>
              <div className="divide-y divide-stone-50">
                {healthMetrics
                  .filter((m) => m.horseId === form.horseId)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 3)
                  .map((m) => (
                    <div key={m.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-stone-400">
                          {formatDateTime(m.timestamp)}
                        </span>
                        {m.assessment && (
                          <span className={`text-xs font-bold ${m.assessment.score >= 80 ? 'text-green-600' : m.assessment.score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            {m.assessment.score}/100
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-xs text-stone-600">
                        <span>🌡️ {m.temperature}°F</span>
                        <span>❤️ {m.heartRate} bpm</span>
                        <span>💨 {m.respiratoryRate}/min</span>
                        <span>⚖️ {m.weight} lbs</span>
                      </div>
                    </div>
                  ))}
                {healthMetrics.filter((m) => m.horseId === form.horseId).length === 0 && (
                  <p className="text-stone-400 text-sm text-center py-4">No records for this horse yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
