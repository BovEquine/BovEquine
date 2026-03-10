'use client';

import { useState } from 'react';
import { useApp } from '@/components/AppProvider';
import AlertCard from '@/components/AlertCard';
import { AlertSeverity, AlertStatus } from '@/lib/types';

type SeverityFilter = AlertSeverity | 'all';
type StatusFilter = AlertStatus | 'all';

export default function AlertsPage() {
  const { state, acknowledgeAlert, resolveAlert } = useApp();
  const { alerts } = state;
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filtered = alerts.filter((a) => {
    const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  const sortedAlerts = [...filtered].sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    const statusOrder = { new: 0, acknowledged: 1, resolved: 2 };
    if (a.status !== b.status) return statusOrder[a.status] - statusOrder[b.status];
    if (a.severity !== b.severity) return severityOrder[a.severity] - severityOrder[b.severity];
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const counts = {
    all: alerts.length,
    new: alerts.filter((a) => a.status === 'new').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
    info: alerts.filter((a) => a.severity === 'info').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Health Alerts</h1>
        <p className="text-stone-500 mt-1">
          {counts.new > 0 ? (
            <span className="text-red-600 font-semibold">{counts.new} new alert{counts.new > 1 ? 's' : ''} requiring attention</span>
          ) : (
            'All alerts managed'
          )}
        </p>
      </div>

      {/* Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.all, bg: 'bg-stone-50', border: 'border-stone-200', text: 'text-stone-700' },
          { label: 'New', value: counts.new, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
          { label: 'Critical', value: counts.critical, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
          { label: 'Warning', value: counts.warning, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl border ${c.bg} ${c.border} p-4`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className="text-sm text-stone-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 flex flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Severity</p>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'warning', 'info'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  severityFilter === s
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s === 'all' ? `All (${counts.all})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Status</p>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'new', 'acknowledged', 'resolved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-amber-700 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {s === 'all' ? `All` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {sortedAlerts.length === 0 ? (
          <div className="text-center py-16 text-stone-400 bg-white rounded-xl border border-stone-200">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-lg font-medium">No alerts match the current filters</p>
            <p className="text-sm">Try adjusting the severity or status filter</p>
          </div>
        ) : (
          sortedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={acknowledgeAlert}
              onResolve={resolveAlert}
            />
          ))
        )}
      </div>
    </div>
  );
}
