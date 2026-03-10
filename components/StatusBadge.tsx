import { HealthStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<HealthStatus, { label: string; classes: string }> = {
  healthy: { label: 'Healthy', classes: 'bg-green-100 text-green-800 border border-green-200' },
  warning: { label: 'Warning', classes: 'bg-amber-100 text-amber-800 border border-amber-200' },
  critical: { label: 'Critical', classes: 'bg-red-100 text-red-800 border border-red-200' },
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, classes } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 font-semibold rounded-full ${classes} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'healthy' ? 'bg-green-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
      {label}
    </span>
  );
}
