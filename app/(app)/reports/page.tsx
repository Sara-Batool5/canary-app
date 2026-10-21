import type { Metadata } from 'next'
import Link from 'next/link'
import { Download } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { StatCards } from '@/components/dashboard/stat-cards'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCompactCurrency, formatCurrency, formatDate } from '@/lib/format'
import { TONE_OPTIONS } from '@/lib/outreach'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Reports' }

export default async function ReportsPage() {
  const supabase = await createClient()

  const [customersRes, outcomesRes, outreachRes] = await Promise.all([
    supabase.from('customers').select('id, name, monthly_revenue').limit(5000),
    supabase
      .from('outcomes')
      .select('customer_id, result, outcome_date')
      .order('outcome_date', { ascending: false })
      .limit(5000),
    supabase
      .from('outreach')
      .select('customer_id, tone, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5000),
  ])

  const customers = customersRes.data ?? []
  const outcomes = outcomesRes.data ?? []
  const outreach = outreachRes.data ?? []

  const byId = new Map(customers.map((c) => [c.id, c]))
  const revenueOf = (id: string) => Number(byId.get(id)?.monthly_revenue ?? 0)

  let savedRevenue = 0
  let lostRevenue = 0
  let savedCount = 0
  let churnedCount = 0
  for (const outcome of outcomes) {
    if (outcome.result === 'saved') {
      savedRevenue += revenueOf(outcome.customer_id)
      savedCount += 1
    } else {
      lostRevenue += revenueOf(outcome.customer_id)
      churnedCount += 1
    }
  }
  const resolved = savedCount + churnedCount
  const saveRate = resolved > 0 ? Math.round((savedCount / resolved) * 100) : null

  // Latest message that was approved or sent, per customer.
  const usedTone = new Map<string, string>()
  for (const row of outreach) {
    if ((row.status === 'approved' || row.status === 'sent') && !usedTone.has(row.customer_id)) {
      usedTone.set(row.customer_id, row.tone)
    }
  }
  const messagesUsed = usedTone.size

  const toneRows = [
    ...TONE_OPTIONS.map((t) => ({ key: t.value as string, label: t.label })),
    { key: 'none', label: 'No message sent' },
  ]
    .map(({ key, label }) => {
      const group = outcomes.filter((o) => (usedTone.get(o.customer_id) ?? 'none') === key)
      const saved = group.filter((o) => o.result === 'saved').length
      return {
        label,
        total: group.length,
        saved,
        rate: group.length > 0 ? Math.round((saved / group.length) * 100) : null,
      }
    })
    .filter((row) => row.total > 0)

  const recent = outcomes.slice(0, 10)

  return (
    <>
      <PageHeader
        title="Reports"
        description="See how many customers you saved, and which messages worked best."
        actions={
          <a
            href="/reports/export"
            download
            className={buttonVariants({ variant: 'outline' })}
          >
            <Download aria-hidden="true" />
            Export CSV
          </a>
        }
      />

      <div className="flex flex-col gap-6">
        <StatCards
          stats={[
            {
              label: 'Revenue saved',
              value: formatCompactCurrency(savedRevenue),
              caption: `${savedCount} ${savedCount === 1 ? 'customer' : 'customers'} saved`,
            },
            {
              label: 'Revenue lost',
              value: formatCompactCurrency(lostRevenue),
              caption: `${churnedCount} ${churnedCount === 1 ? 'customer' : 'customers'} churned`,
            },
            {
              label: 'Save rate',
              value: saveRate === null ? '—' : `${saveRate}%`,
              caption: resolved > 0 ? `Out of ${resolved} resolved accounts` : 'No outcomes recorded yet',
            },
            {
              label: 'Messages used',
              value: String(messagesUsed),
              caption: 'Approved or sent outreach',
            },
          ]}
        />

        {resolved === 0 ? (
          <Card className="items-center gap-3 px-6 py-12 text-center">
            <p className="text-sm font-medium text-foreground">No outcomes recorded yet</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Open a customer and click &ldquo;Mark as saved&rdquo; or &ldquo;Mark as churned&rdquo;.
              Your results and message insights will appear here.
            </p>
            <Link href="/customers?status=red" className={buttonVariants({ variant: 'outline' })}>
              View critical customers
            </Link>
          </Card>
        ) : (
          <>
            <Card className="gap-4 py-6">
              <CardHeader className="px-6">
                <CardTitle>What worked</CardTitle>
                <CardDescription>
                  Save rate by the tone of the message you approved or sent.
                </CardDescription>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-y border-border text-left text-xs text-muted-foreground">
                      <th scope="col" className="px-6 py-2.5 font-medium">Message tone</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Accounts</th>
                      <th scope="col" className="px-3 py-2.5 text-right font-medium">Saved</th>
                      <th scope="col" className="px-6 py-2.5 text-right font-medium">Save rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {toneRows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row" className="px-6 py-3 text-left font-medium text-foreground">
                          {row.label}
                        </th>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                          {row.total}
                        </td>
                        <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                          {row.saved}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-foreground">
                          {row.rate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-6 text-xs text-muted-foreground">
                With only a few accounts, these percentages are a rough guide, not proof.
              </p>
            </Card>

            <Card className="gap-4 py-6">
              <CardHeader className="px-6">
                <CardTitle>Recent outcomes</CardTitle>
              </CardHeader>
              <ul className="divide-y divide-border">
                {recent.map((outcome) => (
                  <li
                    key={outcome.customer_id}
                    className="flex items-center justify-between gap-4 px-6 py-3 text-sm"
                  >
                    <div className="flex flex-col">
                      <Link
                        href={`/customers/${outcome.customer_id}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {byId.get(outcome.customer_id)?.name ?? 'Unknown customer'}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(revenueOf(outcome.customer_id))}/mo ·{' '}
                        {formatDate(outcome.outcome_date)}
                      </span>
                    </div>
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
                  </li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </>
  )
}
