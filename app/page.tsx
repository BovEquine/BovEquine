'use client';

import { useApp } from '@/components/AppProvider';
import StatusBadge from '@/components/StatusBadge';
import AlertCard from '@/components/AlertCard';
import Link from 'next/link';
import { formatShortDate } from '@/lib/dateUtils';

export default function DashboardPage() {
  const { state, acknowledgeAlert, resolveAlert } = useApp();
  const { horses, alerts, healthMetrics } = state;

  const total = horses.length;
  const healthy = horses.filter((h) => h.status === 'healthy').length;
  const warning = horses.filter((h) => h.status === 'warning').length;
  const critical = horses.filter((h) => h.status === 'critical').length;

  const recentAlerts = alerts.filter((a) => a.status !== 'resolved').slice(0, 4);

  const recentMetrics = healthMetrics
    .filter((m) => m.assessment)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
    .reverse();

  const summaryCards = [
    { label: 'Total Horses', value: total, icon: '🐴', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    { label: 'Healthy', value: healthy, icon: '✅', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
    { label: 'Needs Attention', value: warning, icon: '⚠️', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
    { label: 'Critical', value: critical, icon: '🚨', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 mt-1">Monitor your herd&apos;s health at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className={`rounded-xl border ${card.bg} ${card.border} p-5`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${card.text}`}>{card.value}</p>
            <p className="text-sm text-stone-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-800">🐎 Herd Status</h2>
            <Link href="/horses" className="text-sm text-amber-700 hover:text-amber-900 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-stone-50">
            {horses.map((horse) => {
              const lastMetric = healthMetrics
                .filter((m) => m.horseId === horse.id)
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
              return (
                <div key={horse.id} className="flex items-center justify-between px-5 py-4 hover:bg-stone-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                      🐴
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{horse.name}</p>
                      <p className="text-xs text-stone-400">{horse.breed} &bull; {horse.age} yrs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {lastMetric?.assessment && (
                      <span className="text-sm font-bold text-stone-600">{lastMetric.assessment.score}/100</span>
                    )}
                    <StatusBadge status={horse.status} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center justify-between p-5 border-b border-stone-100">
            <h2 className="text-lg font-bold text-stone-800">🔔 Active Alerts</h2>
            <Link href="/alerts" className="text-sm text-amber-700 hover:text-amber-900 font-medium">
              View all →
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {recentAlerts.length === 0 ? (
              <div className="text-center py-8 text-stone-400">
                <p className="text-3xl mb-2">✅</p>
                <p>No active alerts</p>
              </div>
            ) : (
              recentAlerts.map((alert) => (
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200">
        <div className="p-5 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800">📈 AI Health Score Trend</h2>
          <p className="text-sm text-stone-500">Recent health assessments across your herd</p>
        </div>
        <div className="p-5">
          {recentMetrics.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <p>No health metrics recorded yet. <Link href="/health" className="text-amber-700 underline">Log a health check →</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMetrics.map((metric) => {
                const score = metric.assessment?.score ?? 0;
                const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={metric.id} className="flex items-center gap-4">
                    <div className="w-28 text-sm font-medium text-stone-700 truncate">{metric.horseName}</div>
                    <div className="flex-1 h-4 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-bold text-stone-700 text-right">{score}/100</div>
                    <div className="text-xs text-stone-400 w-20 text-right">
                      {formatShortDate(metric.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/horses" className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-xl group-hover:bg-amber-200 transition-colors">🐴</div>
          <div>
            <p className="font-semibold text-stone-800">Manage Horses</p>
            <p className="text-xs text-stone-400">Add or view profiles</p>
          </div>
        </Link>
        <Link href="/health" className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-xl group-hover:bg-green-200 transition-colors">❤️</div>
          <div>
            <p className="font-semibold text-stone-800">Log Health Check</p>
            <p className="text-xs text-stone-400">Record vital signs</p>
          </div>
        </Link>
        <Link href="/alerts" className="flex items-center gap-3 bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-xl group-hover:bg-red-200 transition-colors">🔔</div>
          <div>
            <p className="font-semibold text-stone-800">View Alerts</p>
            <p className="text-xs text-stone-400">{alerts.filter((a) => a.status === 'new').length} new alerts</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
