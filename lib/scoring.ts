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

export type ScoringConfig = {
  idle1Days: number
  idle1Points: number
  idle2Days: number
  idle2Points: number
  idle3Days: number
  idle3Points: number
  ticketPoints: number
  ticketMax: number
  paymentPoints: number
  paymentMax: number
  usageDropPercent: number
  usageDropPoints: number
  greenMin: number
  amberMin: number
}

export const DEFAULT_SCORING: ScoringConfig = {
  idle1Days: 7,
  idle1Points: 15,
  idle2Days: 14,
  idle2Points: 30,
  idle3Days: 21,
  idle3Points: 40,
  ticketPoints: 8,
  ticketMax: 24,
  paymentPoints: 15,
  paymentMax: 30,
  usageDropPercent: 20,
  usageDropPoints: 15,
  greenMin: 70,
  amberMin: 40,
}

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === 'string' ? Number(value) : value
  if (typeof number !== 'number' || !Number.isFinite(number)) return fallback
  return Math.min(max, Math.max(min, Math.round(number)))
}

/** Turns anything (saved settings, form input) into a safe, consistent config. */
export function normalizeScoring(raw: unknown): ScoringConfig {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const d = DEFAULT_SCORING

  const config: ScoringConfig = {
    idle1Days: clampInt(source.idle1Days, 1, 365, d.idle1Days),
    idle1Points: clampInt(source.idle1Points, 0, 100, d.idle1Points),
    idle2Days: clampInt(source.idle2Days, 1, 365, d.idle2Days),
    idle2Points: clampInt(source.idle2Points, 0, 100, d.idle2Points),
    idle3Days: clampInt(source.idle3Days, 1, 365, d.idle3Days),
    idle3Points: clampInt(source.idle3Points, 0, 100, d.idle3Points),
    ticketPoints: clampInt(source.ticketPoints, 0, 100, d.ticketPoints),
    ticketMax: clampInt(source.ticketMax, 0, 100, d.ticketMax),
    paymentPoints: clampInt(source.paymentPoints, 0, 100, d.paymentPoints),
    paymentMax: clampInt(source.paymentMax, 0, 100, d.paymentMax),
    usageDropPercent: clampInt(source.usageDropPercent, 1, 100, d.usageDropPercent),
    usageDropPoints: clampInt(source.usageDropPoints, 0, 100, d.usageDropPoints),
    greenMin: clampInt(source.greenMin, 2, 100, d.greenMin),
    amberMin: clampInt(source.amberMin, 1, 99, d.amberMin),
  }

  // Keep the login tiers in increasing order and the health bands consistent.
  config.idle2Days = Math.max(config.idle2Days, config.idle1Days + 1)
  config.idle3Days = Math.max(config.idle3Days, config.idle2Days + 1)
  if (config.amberMin >= config.greenMin) config.amberMin = Math.max(1, config.greenMin - 1)
  return config
}

export function daysSince(dateString: string | null): number | null {
  if (!dateString) return null
  const time = new Date(`${dateString}T00:00:00Z`).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, Math.floor((Date.now() - time) / 86_400_000))
}

/**
 * Start at 100 and subtract points for warning signs, using the rules in `config`
 * (the defaults are: no login 7/14/21+ days = -15/-30/-40, each open ticket -8 up to -24,
 * each failed payment -15 up to -30, usage down 20% or more = -15).
 * Status: at or above greenMin is green, at or above amberMin is amber, otherwise red.
 */
export function computeHealth(
  input: ScoreInput,
  config: ScoringConfig = DEFAULT_SCORING,
): ScoreResult {
  let score = 100
  const reasons: string[] = []

  const idle = daysSince(input.last_login)
  if (idle !== null) {
    let penalty = 0
    if (idle >= config.idle3Days) penalty = config.idle3Points
    else if (idle >= config.idle2Days) penalty = config.idle2Points
    else if (idle >= config.idle1Days) penalty = config.idle1Points
    if (penalty > 0 || idle >= config.idle1Days) {
      score -= penalty
      reasons.push(`No login for ${idle} days`)
    }
  }

  if (input.open_tickets > 0) {
    score -= Math.min(input.open_tickets * config.ticketPoints, config.ticketMax)
    reasons.push(
      `${input.open_tickets} open support ${input.open_tickets === 1 ? 'ticket' : 'tickets'}`,
    )
  }

  if (input.failed_payments > 0) {
    score -= Math.min(input.failed_payments * config.paymentPoints, config.paymentMax)
    reasons.push(
      `${input.failed_payments} failed ${input.failed_payments === 1 ? 'payment' : 'payments'}`,
    )
  }

  if (input.usage_change_percent <= -config.usageDropPercent) {
    score -= config.usageDropPoints
    reasons.push(`Usage down ${Math.abs(Math.round(input.usage_change_percent))}%`)
  }

  score = Math.max(0, Math.min(100, score))
  const status: DbStatus =
    score >= config.greenMin ? 'green' : score >= config.amberMin ? 'amber' : 'red'
  return { score, status, reasons }
}
