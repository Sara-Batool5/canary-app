import type { Metadata } from 'next'
import Link from 'next/link'
import { Send } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { OutreachCard, type OutreachCustomer } from '@/components/outreach/outreach-card'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { OutreachRow } from '@/lib/outreach'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Outreach' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const COLUMNS = 'id, name, email, plan, monthly_revenue, health_status, risk_reasons'

export default async function OutreachPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>
}) {
  const { customer: focusParam = '' } = await searchParams
  const focusId = UUID.test(focusParam) ? focusParam : null

  const supabase = await createClient()
  const { data: atRisk, error } = await supabase
    .from('customers')
    .select(COLUMNS)
    .in('health_status', ['red', 'amber'])
    .order('monthly_revenue', { ascending: false })
    .limit(50)

  // Accounts that are already saved or churned no longer need outreach.
  const { data: outcomeRows } = await supabase.from('outcomes').select('customer_id')
  const resolved = new Set((outcomeRows ?? []).map((o) => o.customer_id))

  let customers: OutreachCustomer[] = ((atRisk ?? []) as OutreachCustomer[]).filter(
    (c) => !resolved.has(c.id),
  )

  if (focusId) {
    const existing = customers.find((c) => c.id === focusId)
    if (existing) {
      customers = [existing, ...customers.filter((c) => c.id !== focusId)]
    } else {
      const { data: extra } = await supabase
        .from('customers')
        .select(COLUMNS)
        .eq('id', focusId)
        .maybeSingle()
      if (extra) customers = [extra as OutreachCustomer, ...customers]
    }
  }

  const latest = new Map<string, OutreachRow>()
  if (customers.length > 0) {
    const { data: rows } = await supabase
      .from('outreach')
      .select('id, customer_id, message, tone, status, created_at')
      .in(
        'customer_id',
        customers.map((c) => c.id),
      )
      .order('created_at', { ascending: false })
    for (const row of (rows ?? []) as OutreachRow[]) {
      if (!latest.has(row.customer_id)) latest.set(row.customer_id, row)
    }
  }

  const counts = { draft: 0, approved: 0, sent: 0 }
  latest.forEach((row) => {
    counts[row.status] += 1
  })

  return (
    <>
      <PageHeader
        title="Outreach"
        description="Canary drafts a personal message for each at-risk customer. You edit, approve, and send."
      />

      {!process.env.GROQ_API_KEY && (
        <p className="mb-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          AI drafting needs a Groq API key. Add <code className="text-foreground">GROQ_API_KEY</code>{' '}
          in your Vercel environment variables and redeploy.
        </p>
      )}

      {error ? (
        <p role="alert" className="rounded-md bg-health-red/10 px-4 py-3 text-sm text-health-red">
          We couldn&apos;t load your customers: {error.message}
        </p>
      ) : customers.length === 0 ? (
        <Card className="items-center gap-3 px-6 py-12 text-center">
          <Send className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">Nobody needs outreach right now</p>
          <p className="text-sm text-muted-foreground">
            Upload customer data and any at-risk accounts will appear here.
          </p>
          <Link href="/upload" className={buttonVariants({ variant: 'outline' })}>
            Upload data
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {customers.length} {customers.length === 1 ? 'account' : 'accounts'} · {counts.draft}{' '}
            drafted · {counts.approved} approved · {counts.sent} sent
          </p>
          {customers.map((customer) => (
            <OutreachCard
              key={customer.id}
              customer={customer}
              initial={latest.get(customer.id) ?? null}
              highlighted={customer.id === focusId}
            />
          ))}
        </div>
      )}
    </>
  )
}
