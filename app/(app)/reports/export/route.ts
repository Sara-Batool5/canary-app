import { createClient } from '@/lib/supabase/server'

const COLUMNS = [
  'name',
  'email',
  'plan',
  'monthly_revenue',
  'last_login',
  'open_tickets',
  'failed_payments',
  'usage_change_percent',
  'health_score',
  'health_status',
  'risk_reasons',
  'outcome',
]

function cell(value: unknown): string {
  if (value === null || value === undefined) return ''
  let text = Array.isArray(value) ? value.join('; ') : String(value)
  // Stop spreadsheet apps from treating text as a formula.
  if (typeof value === 'string' || Array.isArray(value)) {
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  }
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Please log in.', { status: 401 })

  const [customersRes, outcomesRes] = await Promise.all([
    supabase
      .from('customers')
      .select(
        'id, name, email, plan, monthly_revenue, last_login, open_tickets, failed_payments, usage_change_percent, health_score, health_status, risk_reasons',
      )
      .order('health_score', { ascending: true })
      .limit(5000),
    supabase.from('outcomes').select('customer_id, result').limit(5000),
  ])

  if (customersRes.error) {
    return new Response(`Could not export: ${customersRes.error.message}`, { status: 500 })
  }

  const outcomeById = new Map((outcomesRes.data ?? []).map((o) => [o.customer_id, o.result]))
  const lines = [COLUMNS.join(',')]
  for (const customer of customersRes.data ?? []) {
    const row: Record<string, unknown> = {
      ...customer,
      outcome: outcomeById.get(customer.id) ?? '',
    }
    lines.push(COLUMNS.map((column) => cell(row[column])).join(','))
  }

  return new Response(lines.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="canary-report.csv"',
      'Cache-Control': 'no-store',
    },
  })
}
