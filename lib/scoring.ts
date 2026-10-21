export type DbStatus = 'green' | 'amber' | 'red'

export type ScoreInput = {
  last_login: string | null
  open_tickets: number
  failed_payments: number
  usage_change_percent: number
}

export type ScoreResult = {
  score: number
  status: DbStatus
  reasons: string[]
}

export function daysSince(dateString: string | null): number | null {
  if (!dateString) return null
  const time = new Date(`${dateString}T00:00:00Z`).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000))
}

/**
 * Start at 100 and subtract points for warning signs.
 *  - No login: 7+ days -15, 14+ days -30, 21+ days -40
 *  - Open tickets: -8 each (max -24)
 *  - Failed payments: -15 each (max -30)
 *  - Usage down 20% or more: -15
 * Status: 70-100 green, 40-69 amber, below 40 red.
 */
export function computeHealth(input: ScoreInput): ScoreResult {
  let score = 100
  const reasons: string[] = []

  const idle = daysSince(input.last_login)
  if (idle !== null) {
    if (idle >= 21) {
      score -= 40
      reasons.push(`No login for ${idle} days`)
    } else if (idle >= 14) {
      score -= 30
      reasons.push(`No login for ${idle} days`)
    } else if (idle >= 7) {
      score -= 15
      reasons.push(`No login for ${idle} days`)
    }
  }

  if (input.open_tickets > 0) {
    score -= Math.min(input.open_tickets * 8, 24)
    reasons.push(
      `${input.open_tickets} open support ${input.open_tickets === 1 ? 'ticket' : 'tickets'}`,
    )
  }

  if (input.failed_payments > 0) {
    score -= Math.min(input.failed_payments * 15, 30)
    reasons.push(
      `${input.failed_payments} failed ${input.failed_payments === 1 ? 'payment' : 'payments'}`,
    )
  }

  if (input.usage_change_percent <= -20) {
    score -= 15
    reasons.push(`Usage down ${Math.abs(Math.round(input.usage_change_percent))}%`)
  }

  score = Math.max(0, Math.min(100, score))
  const status: DbStatus = score >= 70 ? 'green' : score >= 40 ? 'amber' : 'red'
  return { score, status, reasons }
}
