'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, Copy, LoaderCircle, Mail, RefreshCw, Sparkles } from 'lucide-react'

import { generateOutreach, saveOutreach, setOutreachStatus } from '@/app/actions/outreach'
import { HealthBadge } from '@/components/health-badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { toBadgeStatus } from '@/lib/health'
import {
  splitMessage,
  TONE_OPTIONS,
  type OutreachRow,
  type OutreachStatus,
  type Tone,
} from '@/lib/outreach'
import { cn } from '@/lib/utils'

export type OutreachCustomer = {
  id: string
  name: string
  email: string | null
  plan: string | null
  monthly_revenue: number
  health_status: string
  risk_reasons: string[] | null
}

const STATUS_STYLES: Record<OutreachStatus, string> = {
  draft: 'bg-foreground/8 text-muted-foreground',
  approved: 'bg-primary/15 text-primary',
  sent: 'bg-health-green/15 text-health-green',
}

type Busy = 'generate' | 'save' | 'status' | null

export function OutreachCard({
  customer,
  initial,
  highlighted,
}: {
  customer: OutreachCustomer
  initial: OutreachRow | null
  highlighted: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [outreach, setOutreach] = useState<OutreachRow | null>(initial)
  const [message, setMessage] = useState(initial?.message ?? '')
  const [tone, setTone] = useState<Tone>(initial?.tone ?? 'friendly')
  const [busy, setBusy] = useState<Busy>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlighted])

  const dirty = outreach !== null && message.trim() !== outreach.message.trim()
  const reasons = customer.risk_reasons ?? []

  function apply(row: OutreachRow) {
    setOutreach(row)
    setMessage(row.message)
    setTone(row.tone)
  }

  async function handleGenerate() {
    if (dirty && !window.confirm('This replaces your unsaved edits. Continue?')) return
    setBusy('generate')
    setError(null)
    try {
      const result = await generateOutreach(customer.id, tone)
      if (result.ok) apply(result.data)
      else setError(result.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  async function handleSave() {
    if (!outreach) return
    setBusy('save')
    setError(null)
    try {
      const result = await saveOutreach(outreach.id, message)
      if (result.ok) apply(result.data)
      else setError(result.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  async function handleStatus(status: OutreachStatus) {
    if (!outreach) return
    setBusy('status')
    setError(null)
    try {
      if (dirty) {
        const saved = await saveOutreach(outreach.id, message)
        if (!saved.ok) {
          setError(saved.error)
          return
        }
      }
      const result = await setOutreachStatus(outreach.id, status)
      if (result.ok) apply(result.data)
      else setError(result.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Could not copy. Select the text and copy it manually.')
    }
  }

  const { subject, body } = splitMessage(message)
  const mailto = customer.email
    ? `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    : null

  return (
    <div ref={ref} id={`customer-${customer.id}`}>
      <Card className={cn('gap-4 px-6 py-5', highlighted && 'ring-1 ring-primary/40')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <Link
              href={`/customers/${customer.id}`}
              className="font-heading text-base font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {customer.name}
            </Link>
            <p className="text-sm text-muted-foreground">
              {[customer.plan, `${formatCurrency(customer.monthly_revenue)}/mo`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {outreach && (
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
                  STATUS_STYLES[outreach.status],
                )}
              >
                {outreach.status}
              </span>
            )}
            <HealthBadge status={toBadgeStatus(customer.health_status)} />
          </div>
        </div>

        {reasons.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <li
                key={reason}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
              >
                {reason}
              </li>
            ))}
          </ul>
        )}

        {outreach ? (
          <div className="flex flex-col gap-3">
            <label htmlFor={`msg-${customer.id}`} className="sr-only">
              Message to {customer.name}
            </label>
            <textarea
              id={`msg-${customer.id}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={9}
              disabled={outreach.status === 'sent'}
              className="w-full resize-y rounded-lg border border-input bg-background/40 px-3 py-2.5 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-70"
            />
            <p className="text-xs text-muted-foreground">
              Review and edit before using. Canary never sends anything for you.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No message yet. Pick a tone and let Canary draft one.
          </p>
        )}

        {error && (
          <p role="alert" className="rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`tone-${customer.id}`} className="sr-only">
            Tone
          </label>
          <select
            id={`tone-${customer.id}`}
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            disabled={busy !== null || outreach?.status === 'sent'}
            className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} className="bg-card">
                {option.label}
              </option>
            ))}
          </select>

          <Button
            onClick={handleGenerate}
            disabled={busy !== null || outreach?.status === 'sent'}
            variant={outreach ? 'outline' : 'default'}
          >
            {busy === 'generate' ? (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            ) : outreach ? (
              <RefreshCw aria-hidden="true" />
            ) : (
              <Sparkles aria-hidden="true" />
            )}
            {busy === 'generate' ? 'Writing…' : outreach ? 'Regenerate' : 'Draft message'}
          </Button>

          {outreach && dirty && (
            <Button variant="outline" onClick={handleSave} disabled={busy !== null}>
              {busy === 'save' ? 'Saving…' : 'Save edits'}
            </Button>
          )}

          {outreach && outreach.status === 'draft' && (
            <Button onClick={() => handleStatus('approved')} disabled={busy !== null}>
              <Check aria-hidden="true" />
              Approve
            </Button>
          )}

          {outreach && (
            <Button variant="outline" onClick={handleCopy} disabled={busy !== null}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          )}

          {outreach && outreach.status !== 'draft' && mailto && (
            <a
              href={mailto}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Mail className="size-4" aria-hidden="true" />
              Open in email app
            </a>
          )}

          {outreach && outreach.status === 'approved' && (
            <Button variant="secondary" onClick={() => handleStatus('sent')} disabled={busy !== null}>
              Mark as sent
            </Button>
          )}
          {outreach && outreach.status === 'approved' && (
            <Button variant="ghost" onClick={() => handleStatus('draft')} disabled={busy !== null}>
              Back to draft
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
