import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'

import { OutcomeCard } from '@/components/customers/outcome-card'
import { HealthBadge } from '@/components/health-badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate, formatDaysAgo } from '@/lib/format'
import { statusColors, toBadgeStatus } from '@/lib/health'
import { daysSince, type DbStatus } from '@/lib/scoring'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Customer' }

function ScoreRing({ score, status }: { score: number; status: DbStatus }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  return (
    <div className="relative size-36" role="img" aria-label={`Health score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" className="size-full -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={statusColors[status]}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">
          {score}
        </span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 px-5 py-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-heading text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </Card>
  )
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!customer) notFound()

  const { data: outcome } = await supabase
    .from('outcomes')
    .select('result, outcome_date')
    .eq('customer_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const status = (customer.health_status ?? 'green') as DbStatus
  const reasons: string[] = customer.risk_reasons ?? []
  const usage = Number(customer.usage_change_percent ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/customers"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All customers
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {customer.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {[customer.plan, customer.email].filter(Boolean).join(' · ') || 'No plan or email on file'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HealthBadge status={toBadgeStatus(status)} />
            <Link
              href={`/outreach?customer=${customer.id}`}
              className={buttonVariants({ size: 'lg' })}
            >
              <Send aria-hidden="true" />
              Draft outreach
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="items-center gap-4 px-8 py-6">
          <ScoreRing score={customer.health_score ?? 0} status={status} />
          <p className="text-sm text-muted-foreground">Health score</p>
        </Card>

        <Card className="gap-4 py-6">
          <CardHeader className="px-6">
            <CardTitle>Why this score</CardTitle>
            <CardDescription>The warning signs Canary found for this account.</CardDescription>
          </CardHeader>
          <div className="px-6">
            {reasons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No warning signs. This customer looks healthy.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {reasons.map((reason) => (
                  <li key={reason} className="flex items-center gap-2 text-sm text-foreground">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: statusColors[status] }}
                      aria-hidden="true"
                    />
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <OutcomeCard
        customerId={customer.id}
        initial={outcome as { result: 'saved' | 'churned'; outcome_date: string } | null}
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <Stat label="Monthly revenue" value={formatCurrency(customer.monthly_revenue)} />
        <Stat
          label="Last login"
          value={formatDaysAgo(daysSince(customer.last_login))}
        />
        <Stat label="Open tickets" value={String(customer.open_tickets ?? 0)} />
        <Stat label="Failed payments" value={String(customer.failed_payments ?? 0)} />
        <Stat label="Usage change" value={`${usage > 0 ? '+' : ''}${usage}%`} />
      </div>

      <p className="text-xs text-muted-foreground">
        Last login date on file: {formatDate(customer.last_login)}
      </p>
    </div>
  )
}
