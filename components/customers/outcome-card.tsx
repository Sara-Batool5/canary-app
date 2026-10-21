'use client'

import { useState } from 'react'
import { Check, LoaderCircle, X } from 'lucide-react'

import { setOutcome, type OutcomeResult, type OutcomeRow } from '@/app/actions/outcomes'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

export function OutcomeCard({
  customerId,
  initial,
}: {
  customerId: string
  initial: OutcomeRow | null
}) {
  const [outcome, setOutcomeState] = useState<OutcomeRow | null>(initial)
  const [busy, setBusy] = useState<OutcomeResult | 'clear' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function update(result: OutcomeResult | null) {
    setBusy(result ?? 'clear')
    setError(null)
    try {
      const response = await setOutcome(customerId, result)
      if (response.ok) setOutcomeState(response.data)
      else setError(response.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="gap-4 py-6">
      <CardHeader className="px-6">
        <CardTitle>Outcome</CardTitle>
        <CardDescription>
          Record what happened, so Canary can show how much revenue you saved.
        </CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-4 px-6">
        {outcome && (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                outcome.result === 'saved'
                  ? 'bg-health-green/15 text-health-green'
                  : 'bg-health-red/15 text-health-red',
              )}
            >
              {outcome.result === 'saved' ? 'Saved' : 'Churned'}
            </span>
            <span className="text-muted-foreground">on {formatDate(outcome.outcome_date)}</span>
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {outcome?.result !== 'saved' && (
            <Button onClick={() => update('saved')} disabled={busy !== null}>
              {busy === 'saved' ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <Check aria-hidden="true" />
              )}
              Mark as saved
            </Button>
          )}
          {outcome?.result !== 'churned' && (
            <Button variant="outline" onClick={() => update('churned')} disabled={busy !== null}>
              {busy === 'churned' ? (
                <LoaderCircle className="animate-spin" aria-hidden="true" />
              ) : (
                <X aria-hidden="true" />
              )}
              Mark as churned
            </Button>
          )}
          {outcome && (
            <Button variant="ghost" onClick={() => update(null)} disabled={busy !== null}>
              Clear outcome
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
