import type { SupabaseClient } from '@supabase/supabase-js'

import { formatCurrency } from '@/lib/format'

export type AppNotification = {
  id: string
  title: string
  description: string
  href: string
  tone: 'red' | 'amber' | 'green' | 'info'
  count: number
}

const plural = (count: number, one: string, many: string) => (count === 1 ? one : many)

export async function getNotifications(supabase: SupabaseClient): Promise<AppNotification[]> {
  try {
    const [totalRes, atRiskRes, outcomesRes, outreachRes] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase
        .from('customers')
        .select('id, name, monthly_revenue, health_status')
        .in('health_status', ['red', 'amber'])
        .limit(2000),
      supabase.from('outcomes').select('customer_id').limit(5000),
      supabase
        .from('outreach')
        .select('customer_id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5000),
    ])

    const total = totalRes.count ?? 0
    if (total === 0) {
      return [
        {
          id: 'upload',
          title: 'Upload your customer data',
          description: 'Import a CSV and Canary will score every account.',
          href: '/upload',
          tone: 'info',
          count: 1,
        },
      ]
    }

    const resolved = new Set((outcomesRes.data ?? []).map((o) => o.customer_id as string))
    const open = (atRiskRes.data ?? []).filter((c) => !resolved.has(c.id))
    const critical = open
      .filter((c) => c.health_status === 'red')
      .sort((a, b) => Number(b.monthly_revenue) - Number(a.monthly_revenue))
    const atRisk = open.filter((c) => c.health_status === 'amber')

    const latest = new Map<string, string>()
    for (const row of outreachRes.data ?? []) {
      if (!latest.has(row.customer_id)) latest.set(row.customer_id, row.status as string)
    }
    let drafts = 0
    let approved = 0
    latest.forEach((status, customerId) => {
      if (resolved.has(customerId)) return
      if (status === 'draft') drafts += 1
      if (status === 'approved') approved += 1
    })
    const criticalNoMessage = critical.filter((c) => !latest.has(c.id))

    const notifications: AppNotification[] = []

    if (critical.length > 0) {
      notifications.push({
        id: 'critical',
        title: `${critical.length} critical ${plural(critical.length, 'account needs', 'accounts need')} attention`,
        description: `Largest: ${critical[0].name} (${formatCurrency(critical[0].monthly_revenue)}/mo)`,
        href: '/customers?status=red',
        tone: 'red',
        count: critical.length,
      })
    }
    if (criticalNoMessage.length > 0) {
      notifications.push({
        id: 'no-message',
        title: `${criticalNoMessage.length} critical ${plural(criticalNoMessage.length, 'account has', 'accounts have')} no message yet`,
        description: 'Draft outreach while there is still time.',
        href: '/outreach',
        tone: 'amber',
        count: criticalNoMessage.length,
      })
    }
    if (drafts > 0) {
      notifications.push({
        id: 'drafts',
        title: `${drafts} ${plural(drafts, 'draft is', 'drafts are')} waiting for approval`,
        description: 'Review, edit and approve them.',
        href: '/outreach',
        tone: 'info',
        count: drafts,
      })
    }
    if (approved > 0) {
      notifications.push({
        id: 'approved',
        title: `${approved} approved ${plural(approved, 'message is', 'messages are')} ready to send`,
        description: 'Send from your email app, then mark as sent.',
        href: '/outreach',
        tone: 'green',
        count: approved,
      })
    }
    if (atRisk.length > 0) {
      notifications.push({
        id: 'at-risk',
        title: `${atRisk.length} ${plural(atRisk.length, 'account is', 'accounts are')} at risk`,
        description: 'Keep an eye on these before they turn critical.',
        href: '/customers?status=amber',
        tone: 'amber',
        count: atRisk.length,
      })
    }

    return notifications.slice(0, 5)
  } catch {
    return []
  }
}
