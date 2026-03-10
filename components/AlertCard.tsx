import { Alert, AlertSeverity, AlertStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/dateUtils';

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

const severityConfig: Record<AlertSeverity, { bg: string; border: string; icon: string; label: string }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️', label: 'Info' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️', label: 'Warning' },
  critical: { bg: 'bg-red-50', border: 'border-red-200', icon: '🚨', label: 'Critical' },
};

const statusConfig: Record<AlertStatus, { label: string; classes: string }> = {
  new: { label: 'New', classes: 'bg-blue-100 text-blue-800' },
  acknowledged: { label: 'Acknowledged', classes: 'bg-amber-100 text-amber-800' },
  resolved: { label: 'Resolved', classes: 'bg-green-100 text-green-800' },
};

export default function AlertCard({ alert, onAcknowledge, onResolve }: AlertCardProps) {
  const sev = severityConfig[alert.severity];
  const sta = statusConfig[alert.status];

  const formattedDate = formatDateTime(alert.createdAt);

  return (
    <div className={`rounded-xl border ${sev.bg} ${sev.border} p-4`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">{sev.icon}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-stone-800">{alert.title}</h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${sta.classes}`}>{sta.label}</span>
            </div>
            <p className="text-sm text-stone-500 mt-0.5">
              🐴 {alert.horseName} &bull; {formattedDate}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
          alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
          alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
        }`}>{sev.label}</span>
      </div>
      <p className="text-sm text-stone-600 mb-3 ml-7">{alert.message}</p>
      {alert.status !== 'resolved' && (
        <div className="flex gap-2 ml-7">
          {alert.status === 'new' && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.id)}
              className="text-xs px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Acknowledge
            </button>
          )}
          {onResolve && (
            <button
              onClick={() => onResolve(alert.id)}
              className="text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Mark Resolved
            </button>
          )}
        </div>
      )}
    </div>
  );
}
