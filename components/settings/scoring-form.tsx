'use client'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'

import { resetScoring, saveScoring } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DEFAULT_SCORING, type ScoringConfig } from '@/lib/scoring'

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  suffix?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
          className="h-9 w-24 tabular-nums"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  )
}

function Group({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <legend className="sr-only">{title}</legend>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </fieldset>
  )
}

export function ScoringForm({ initial }: { initial: ScoringConfig }) {
  const [values, setValues] = useState<ScoringConfig>(initial)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const set = (key: keyof ScoringConfig) => (value: number) =>
    setValues((current) => ({ ...current, [key]: value }))

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const result = await saveScoring(values)
      if (result.ok) {
        setValues(result.data)
        setMessage({
          ok: true,
          text: 'Saved. Scores now update everywhere, with no re-upload needed.',
        })
      } else {
        setMessage({ ok: false, text: result.error })
      }
    } catch {
      setMessage({ ok: false, text: 'Something went wrong. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    setMessage(null)
    try {
      const result = await resetScoring()
      if (result.ok) {
        setValues(result.data)
        setMessage({ ok: true, text: 'Back to the default rules.' })
      } else {
        setMessage({ ok: false, text: result.error })
      }
    } catch {
      setMessage({ ok: false, text: 'Something went wrong. Please try again.' })
    } finally {
      setResetting(false)
    }
  }

  const changed = JSON.stringify(values) !== JSON.stringify(DEFAULT_SCORING)

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <Group
        title="Time since last login"
        description="Points removed when a customer has not logged in for this many days. Only the highest matching level applies."
      >
        <NumberField id="idle1d" label="Level 1: after (days)" value={values.idle1Days} onChange={set('idle1Days')} min={1} max={365} />
        <NumberField id="idle1p" label="Level 1: points removed" value={values.idle1Points} onChange={set('idle1Points')} min={0} max={100} />
        <div className="hidden xl:block" />
        <NumberField id="idle2d" label="Level 2: after (days)" value={values.idle2Days} onChange={set('idle2Days')} min={1} max={365} />
        <NumberField id="idle2p" label="Level 2: points removed" value={values.idle2Points} onChange={set('idle2Points')} min={0} max={100} />
        <div className="hidden xl:block" />
        <NumberField id="idle3d" label="Level 3: after (days)" value={values.idle3Days} onChange={set('idle3Days')} min={1} max={365} />
        <NumberField id="idle3p" label="Level 3: points removed" value={values.idle3Points} onChange={set('idle3Points')} min={0} max={100} />
      </Group>

      <Group
        title="Support tickets and payments"
        description="Points removed for each open ticket or failed payment, up to a maximum."
      >
        <NumberField id="tp" label="Per open ticket" value={values.ticketPoints} onChange={set('ticketPoints')} min={0} max={100} suffix="points" />
        <NumberField id="tm" label="Tickets: maximum removed" value={values.ticketMax} onChange={set('ticketMax')} min={0} max={100} suffix="points" />
        <div className="hidden xl:block" />
        <NumberField id="pp" label="Per failed payment" value={values.paymentPoints} onChange={set('paymentPoints')} min={0} max={100} suffix="points" />
        <NumberField id="pm" label="Payments: maximum removed" value={values.paymentMax} onChange={set('paymentMax')} min={0} max={100} suffix="points" />
      </Group>

      <Group
        title="Falling usage"
        description="Points removed when a customer's usage drops by at least this percentage."
      >
        <NumberField id="ud" label="Usage drop of at least" value={values.usageDropPercent} onChange={set('usageDropPercent')} min={1} max={100} suffix="%" />
        <NumberField id="up" label="Points removed" value={values.usageDropPoints} onChange={set('usageDropPoints')} min={0} max={100} />
      </Group>

      <Group
        title="Health bands"
        description="Every customer starts at 100. The final score decides the colour."
      >
        <NumberField id="gm" label="Healthy: score at or above" value={values.greenMin} onChange={set('greenMin')} min={2} max={100} />
        <NumberField id="am" label="At risk: score at or above" value={values.amberMin} onChange={set('amberMin')} min={1} max={99} />
        <p className="self-end pb-2 text-xs text-muted-foreground">
          Below the &ldquo;at risk&rdquo; number, a customer is critical.
        </p>
      </Group>

      {message && (
        <p
          role={message.ok ? 'status' : 'alert'}
          className={
            message.ok
              ? 'rounded-md bg-health-green/10 px-3 py-2 text-sm text-health-green'
              : 'rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red'
          }
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || resetting}>
          {saving && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          Save scoring rules
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={saving || resetting || !changed}
        >
          {resetting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          Reset to defaults
        </Button>
      </div>
    </form>
  )
}
