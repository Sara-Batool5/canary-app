import type { User } from '@supabase/supabase-js'

import {
  computeHealth,
  normalizeScoring,
  type DbStatus,
  type ScoringConfig,
} from '@/lib/scoring'

/** Raw columns only. Health is always calculated live from these. */
export const CUSTOMER_COLUMNS =
  'id, name, email, plan, monthly_revenue, last_login, open_tickets, failed_payments, usage_change_percent'

export type CustomerRow = {
  id: string
  name: string
  email: string | null
  plan: string | null
  monthly_revenue: number | string | null
  last_login: string | null
  open_tickets: number | null
  failed_payments: number | null
  usage_change_percent: number | string | null
}

export type ScoredCustomer = Omit<CustomerRow, 'monthly_revenue'> & {
  monthly_revenue: number
  health_score: number
  health_status: DbStatus
  risk_reasons: string[]
}

export function getScoringConfig(user: User | null | undefined): ScoringConfig {
  return normalizeScoring(user?.user_metadata?.scoring)
}

export function scoreCustomer(row: CustomerRow, config: ScoringConfig): ScoredCustomer {
  const health = computeHealth(
    {
      last_login: row.last_login,
      open_tickets: Number(row.open_tickets ?? 0),
      failed_payments: Number(row.failed_payments ?? 0),
      usage_change_percent: Number(row.usage_change_percent ?? 0),
    },
    config,
  )
  return {
    ...row,
    monthly_revenue: Number(row.monthly_revenue ?? 0),
    health_score: health.score,
    health_status: health.status,
    risk_reasons: health.reasons,
  }
}

export function scoreCustomers(rows: CustomerRow[] | null | undefined, config: ScoringConfig) {
  return (rows ?? []).map((row) => scoreCustomer(row, config))
}
