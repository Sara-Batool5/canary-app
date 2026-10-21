import type { Metadata } from 'next'
import Link from 'next/link'
import { Upload } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { AttentionTable } from '@/components/dashboard/attention-table'
import { HealthDistribution } from '@/components/dashboard/health-distribution'
import { StatCards } from '@/components/dashboard/stat-cards'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactCurrency, formatNumber } from '@/lib/format'
import type { DbStatus } from '@/lib/scoring'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers')
    .select('id, name, plan, monthly_revenue, health_status, risk_reasons')
    .limit(5000)

  const customers = data ?? []
  const { data: outcomeRows } = await supabase.from('outcomes').select('customer_id, result')

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" description="A snapshot of churn risk across your customer base." />
        <p role="alert" className="rounded-md bg-health-red/10 px-4 py-3 text-sm text-health-red">
          We couldn&apos;t load your data: {error.message}
        </p>
      </>
    )
  }

  if (customers.length === 0) {
    return (
      <>
        <PageHeader title="Dashboard" description="A snapshot of churn risk across your customer base." />
        <Card className="items-center gap-4 px-6 py-12 text-center">
          <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
          <CardHeader className="justify-items-center px-0">
            <CardTitle>No customer data yet</CardTitle>
            <CardDescription>
              Upload a CSV and Canary will score every account and show who needs attention.
            </CardDescription>
          </CardHeader>
          <Link href="/upload" className={buttonVariants({ size: 'lg' })}>
            Upload customer data
          </Link>
        </Card>
      </>
    )
  }

  const totals: Record<DbStatus, { count: number; revenue: number }> = {
    green: { count: 0, revenue: 0 },
    amber: { count: 0, revenue: 0 },
    red: { count: 0, revenue: 0 },
  }
  for (const customer of customers) {
    const status = (customer.health_status as DbStatus) in totals ? (customer.health_status as DbStatus) : 'green'
    totals[status].count += 1
    totals[status].revenue += Number(customer.monthly_revenue ?? 0)
  }

  const atRiskCount = totals.amber.count + totals.red.count
  const revenueAtRisk = totals.amber.revenue + totals.red.revenue
  const healthyShare = Math.round((totals.green.count / customers.length) * 100)

  // Accounts that already have an outcome no longer need attention.
  const resolved = new Set((outcomeRows ?? []).map((o) => o.customer_id))
  const revenueById = new Map(customers.map((c) => [c.id, Number(c.monthly_revenue ?? 0)]))
  let savedRevenue = 0
  let savedCount = 0
  for (const outcome of outcomeRows ?? []) {
    if (outcome.result === 'saved') {
      savedRevenue += revenueById.get(outcome.customer_id) ?? 0
      savedCount += 1
    }
  }

  const attention = customers
    .filter(
      (c) => (c.health_status === 'red' || c.health_status === 'amber') && !resolved.has(c.id),
    )
    .sort((a, b) => {
      if (a.health_status !== b.health_status) return a.health_status === 'red' ? -1 : 1
      return Number(b.monthly_revenue) - Number(a.monthly_revenue)
    })
    .slice(0, 5)

  return (
    <>
      <PageHeader title="Dashboard" description="A snapshot of churn risk across your customer base." />
      <div className="flex flex-col gap-6">
        <StatCards
          stats={[
            {
              label: 'Total customers',
              value: formatNumber(customers.length),
              caption: `${healthyShare}% are healthy`,
            },
            {
              label: 'At-risk customers',
              value: formatNumber(atRiskCount),
              caption: `${totals.red.count} critical · ${totals.amber.count} at risk`,
            },
            {
              label: 'Revenue at risk',
              value: formatCompactCurrency(revenueAtRisk),
              caption: 'Monthly revenue from at-risk accounts',
            },
            {
              label: 'Revenue saved',
              value: formatCompactCurrency(savedRevenue),
              caption:
                savedCount > 0
                  ? `${savedCount} ${savedCount === 1 ? 'customer' : 'customers'} saved`
                  : 'Mark outcomes on customer pages',
            },
          ]}
        />

        <HealthDistribution
          segments={[
            { status: 'green', ...totals.green },
            { status: 'amber', ...totals.amber },
            { status: 'red', ...totals.red },
          ]}
        />

        <AttentionTable accounts={attention} />
      </div>
    </>
  )
}
