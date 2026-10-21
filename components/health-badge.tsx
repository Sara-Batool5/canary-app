import type { HealthStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const styles: Record<HealthStatus, { label: string; className: string }> = {
  healthy: {
    label: 'Healthy',
    className: 'bg-health-green/15 text-health-green',
  },
  'at-risk': {
    label: 'At risk',
    className: 'bg-health-amber/15 text-health-amber',
  },
  critical: {
    label: 'Critical',
    className: 'bg-health-red/15 text-health-red',
  },
}

export function HealthBadge({ status }: { status: HealthStatus }) {
  const { label, className } = styles[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  )
}
