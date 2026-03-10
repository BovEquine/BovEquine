interface HealthMetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  normalRange: string;
  status: 'normal' | 'warning' | 'critical';
}

const statusConfig = {
  normal: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
};

export default function HealthMetricCard({ label, value, unit, icon, normalRange, status }: HealthMetricCardProps) {
  const cfg = statusConfig[status];
  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge} capitalize`}>{status}</span>
      </div>
      <p className="text-sm text-stone-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold ${cfg.text}`}>
        {value} <span className="text-sm font-normal text-stone-500">{unit}</span>
      </p>
      <p className="text-xs text-stone-400 mt-1">Normal: {normalRange}</p>
    </div>
  );
}
