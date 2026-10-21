import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { HealthBadge } from '@/components/health-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { daysSince } from '@/lib/scoring'
import { formatCurrency, formatDaysAgo } from '@/lib/format'
import { toBadgeStatus } from '@/lib/health'
import { createClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Customers' }

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Healthy', value: 'green' },
  { label: 'At risk', value: 'amber' },
  { label: 'Critical', value: 'red' },
]

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status = '', q = '' } = await searchParams
  const query = q.trim()
  const activeStatus = ['green', 'amber', 'red'].includes(status) ? status : ''

  const supabase = await createClient()
  let request = supabase
    .from('customers')
    .select('id, name, email, plan, monthly_revenue, last_login, health_score, health_status')
    .order('health_score', { ascending: true })
    .order('monthly_revenue', { ascending: false })
    .limit(500)

  if (activeStatus) request = request.eq('health_status', activeStatus)
  if (query) request = request.ilike('name', `%${query.replace(/[%,]/g, '')}%`)

  const { data, error } = await request
  const customers = data ?? []

  const hrefFor = (value: string) => {
    const params = new URLSearchParams()
    if (value) params.set('status', value)
    if (query) params.set('q', query)
    const qs = params.toString()
    return qs ? `/customers?${qs}` : '/customers'
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description="Every account, ranked by health and churn risk."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by health">
          {FILTERS.map((filter) => {
            const active = activeStatus === filter.value
            return (
              <Link
                key={filter.label}
                href={hrefFor(filter.value)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  active
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
              >
                {filter.label}
              </Link>
            )
          })}
        </div>

        <form action="/customers" className="flex items-center gap-2">
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by name…"
              aria-label="Search customers by name"
              className="h-9 w-56 pl-9"
            />
          </div>
          <Button type="submit" variant="outline" className="h-9">
            Search
          </Button>
        </form>
      </div>

      {error ? (
        <p role="alert" className="rounded-md bg-health-red/10 px-4 py-3 text-sm text-health-red">
          We couldn&apos;t load your customers: {error.message}
        </p>
      ) : customers.length === 0 ? (
        <Card className="items-center gap-3 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            {query || activeStatus ? 'No customers match these filters.' : 'No customers yet.'}
          </p>
          <p className="text-sm text-muted-foreground">
            {query || activeStatus
              ? 'Try clearing the search or choosing a different filter.'
              : 'Upload a CSV to see your accounts here.'}
          </p>
          <Link
            href={query || activeStatus ? '/customers' : '/upload'}
            className={buttonVariants({ variant: 'outline' })}
          >
            {query || activeStatus ? 'Clear filters' : 'Upload data'}
          </Link>
        </Card>
      ) : (
        <Card className="gap-0 py-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th scope="col" className="px-6 py-3 font-medium">Customer</th>
                  <th scope="col" className="px-3 py-3 font-medium">Plan</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Monthly revenue</th>
                  <th scope="col" className="px-3 py-3 font-medium">Last login</th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">Score</th>
                  <th scope="col" className="px-6 py-3 font-medium">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr key={customer.id} className="transition-colors hover:bg-foreground/3">
                    <th scope="row" className="px-6 py-3 text-left font-medium text-foreground">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {customer.name}
                      </Link>
                      {customer.email && (
                        <span className="block text-xs font-normal text-muted-foreground">
                          {customer.email}
                        </span>
                      )}
                    </th>
                    <td className="px-3 py-3 text-muted-foreground">{customer.plan ?? '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">
                      {formatCurrency(customer.monthly_revenue)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDaysAgo(daysSince(customer.last_login))}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">
                      {customer.health_score ?? '—'}
                    </td>
                    <td className="px-6 py-3">
                      <HealthBadge status={toBadgeStatus(customer.health_status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  )
}
