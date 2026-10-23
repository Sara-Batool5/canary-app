'use server'

import { revalidatePath } from 'next/cache'

import { CUSTOMER_COLUMNS, getScoringConfig, scoreCustomers } from '@/lib/customers'
import { DEMO_ROWS, demoMessage, type DemoTone } from '@/lib/demo-data'
import { computeHealth } from '@/lib/scoring'
import { createClient } from '@/lib/supabase/server'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10)
}

export async function loadDemoData(): Promise<Result<number>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in again.' }
  const config = getScoringConfig(user)

  const { count } = await supabase.from('customers').select('id', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: 'You already have customer data. Delete it first if you want to load the demo.',
    }
  }

  const rows = DEMO_ROWS.map((demo) => {
    const lastLogin = isoDaysAgo(demo.daysAgo)
    const health = computeHealth(
      {
        last_login: lastLogin,
        open_tickets: demo.tickets,
        failed_payments: demo.failedPayments,
        usage_change_percent: demo.usageChange,
      },
      config,
    )
    const slug = demo.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)
    return {
      name: demo.name,
      email: `billing@${slug}.com`,
      plan: demo.plan,
      monthly_revenue: demo.revenue,
      last_login: lastLogin,
      open_tickets: demo.tickets,
      failed_payments: demo.failedPayments,
      usage_change_percent: demo.usageChange,
      health_score: health.score,
      health_status: health.status,
      risk_reasons: health.reasons,
    }
  })

  const { data: inserted, error } = await supabase
    .from('customers')
    .insert(rows)
    .select(CUSTOMER_COLUMNS)
  if (error || !inserted) {
    return { ok: false, error: `Could not load the demo: ${error?.message ?? 'unknown error'}` }
  }

  // A realistic story: a few saved and lost accounts, sent messages, drafts and approvals.
  const scored = scoreCustomers(inserted, config)
  const byRevenue = (a: { monthly_revenue: number }, b: { monthly_revenue: number }) =>
    b.monthly_revenue - a.monthly_revenue
  const reds = scored.filter((c) => c.health_status === 'red').sort(byRevenue)
  const ambers = scored.filter((c) => c.health_status === 'amber').sort(byRevenue)

  const outcomes: { customer_id: string; result: 'saved' | 'churned' }[] = []
  const messages: { customer_id: string; message: string; tone: DemoTone; status: 'draft' | 'approved' | 'sent' }[] = []
  const add = (
    customer: { id: string; name: string } | undefined,
    tone: DemoTone,
    status: 'draft' | 'approved' | 'sent',
    result?: 'saved' | 'churned',
  ) => {
    if (!customer) return
    messages.push({ customer_id: customer.id, message: demoMessage(customer.name, tone), tone, status })
    if (result) outcomes.push({ customer_id: customer.id, result })
  }

  add(reds[0], 'friendly', 'sent', 'saved')
  add(reds[1], 'formal', 'sent', 'churned')
  add(reds[2], 'short', 'sent', 'saved')
  add(ambers[0], 'friendly', 'sent', 'saved')
  add(reds[3], 'friendly', 'draft')
  add(reds[4], 'formal', 'approved')

  if (messages.length > 0) await supabase.from('outreach').insert(messages)
  if (outcomes.length > 0) await supabase.from('outcomes').insert(outcomes)

  revalidatePath('/', 'layout')
  return { ok: true, data: inserted.length }
}

export async function clearAllData(): Promise<Result<true>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  // Outcomes and messages are removed automatically with their customers.
  const { error } = await supabase.from('customers').delete().not('id', 'is', null)
  if (error) return { ok: false, error: `Could not delete: ${error.message}` }

  revalidatePath('/', 'layout')
  return { ok: true, data: true }
}
