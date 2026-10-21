import type { HealthStatus } from '@/lib/mock-data'
import type { DbStatus } from '@/lib/scoring'

export function toBadgeStatus(status: string | null | undefined): HealthStatus {
  if (status === 'red') return 'critical'
  if (status === 'amber') return 'at-risk'
  return 'healthy'
}

export const statusLabels: Record<DbStatus, string> = {
  green: 'Healthy',
  amber: 'At risk',
  red: 'Critical',
}

export const statusColors: Record<DbStatus, string> = {
  green: 'var(--health-green)',
  amber: 'var(--health-amber)',
  red: 'var(--health-red)',
}
