import {
  computeHealth,
  DEFAULT_SCORING,
  type DbStatus,
  type ScoringConfig,
} from '@/lib/scoring'

export type ParsedCustomer = {
  name: string
  email: string | null
  plan: string | null
  monthly_revenue: number
  last_login: string
  open_tickets: number
  failed_payments: number
  usage_change_percent: number
  health_score: number
  health_status: DbStatus
  risk_reasons: string[]
}

export type ParseResult = {
  customers: ParsedCustomer[]
  errors: string[]
  totalRows: number
  /** Which optional/required columns were found in the file. */
  columns: string[]
}

export const MAX_ROWS = 2000

export const TEMPLATE_CSV = [
  'name,email,plan,monthly_revenue,last_login,open_tickets,failed_payments,usage_change_percent',
  'Acme Analytics,billing@acme.io,Enterprise,4200,2026-10-18,0,0,5',
  'Brightline Labs,ops@brightline.co,Growth,1850,2026-09-28,3,1,-32',
  'Orbit Logistics,finance@orbit.com,Scale,6900,2026-09-15,2,2,-61',
].join('\n')

const ALIASES: Record<string, string[]> = {
  name: ['name', 'customer', 'customer_name', 'company', 'account'],
  email: ['email', 'contact_email'],
  plan: ['plan', 'tier'],
  monthly_revenue: ['monthly_revenue', 'mrr', 'revenue', 'monthly_recurring_revenue'],
  last_login: ['last_login', 'last_active', 'last_seen', 'last_login_date'],
  open_tickets: ['open_tickets', 'tickets', 'support_tickets'],
  failed_payments: ['failed_payments', 'payment_failures'],
  usage_change_percent: ['usage_change_percent', 'usage_change', 'usage_change_pct'],
}

const REQUIRED = ['name', 'monthly_revenue', 'last_login']

export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < src.length; i++) {
    const char = src[i]
    if (inQuotes) {
      if (char === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && src[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += char
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_').replace(/%/g, 'percent')
}

function toNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === '') return null
  const cleaned = value.replace(/[$,%\s]/g, '')
  const number = Number(cleaned)
  return Number.isFinite(number) ? number : null
}

function toIsoDate(value: string | undefined): string | null {
  if (!value || value.trim() === '') return null
  const text = value.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return Number.isNaN(new Date(`${text}T00:00:00Z`).getTime()) ? null : text
  }
  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return null
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, '0')
  const d = String(parsed.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseCustomersCsv(
  text: string,
  config: ScoringConfig = DEFAULT_SCORING,
): ParseResult {
  const rows = parseCsv(text)
  const errors: string[] = []

  if (rows.length < 2) {
    return {
      customers: [],
      errors: ['The file needs a header row and at least one customer row.'],
      totalRows: 0,
      columns: [],
    }
  }

  const headers = rows[0].map(normalizeHeader)
  const columnIndex: Record<string, number> = {}
  for (const [key, aliases] of Object.entries(ALIASES)) {
    const index = headers.findIndex((header) => aliases.includes(header))
    if (index !== -1) columnIndex[key] = index
  }

  const missing = REQUIRED.filter((key) => columnIndex[key] === undefined)
  if (missing.length > 0) {
    return {
      customers: [],
      errors: [
        `Missing required column(s): ${missing.join(', ')}. Download the template to see the expected format.`,
      ],
      totalRows: rows.length - 1,
      columns: [],
    }
  }

  const dataRows = rows.slice(1)
  if (dataRows.length > MAX_ROWS) {
    return {
      customers: [],
      errors: [`This file has ${dataRows.length} rows. The limit is ${MAX_ROWS} per upload.`],
      totalRows: dataRows.length,
      columns: [],
    }
  }

  const get = (row: string[], key: string) =>
    columnIndex[key] === undefined ? undefined : row[columnIndex[key]]

  const customers: ParsedCustomer[] = []
  dataRows.forEach((row, i) => {
    const line = i + 2
    const name = (get(row, 'name') ?? '').trim()
    const revenue = toNumber(get(row, 'monthly_revenue'))
    const lastLogin = toIsoDate(get(row, 'last_login'))

    if (!name) return void errors.push(`Row ${line}: customer name is empty.`)
    if (revenue === null || revenue < 0)
      return void errors.push(`Row ${line} (${name}): monthly_revenue must be a number.`)
    if (!lastLogin)
      return void errors.push(`Row ${line} (${name}): last_login must be a valid date, like 2026-10-18.`)

    const openTickets = Math.max(0, Math.round(toNumber(get(row, 'open_tickets')) ?? 0))
    const failedPayments = Math.max(0, Math.round(toNumber(get(row, 'failed_payments')) ?? 0))
    const usageChange = toNumber(get(row, 'usage_change_percent')) ?? 0

    const health = computeHealth({
      last_login: lastLogin,
      open_tickets: openTickets,
      failed_payments: failedPayments,
      usage_change_percent: usageChange,
    }, config)

    customers.push({
      name,
      email: (get(row, 'email') ?? '').trim() || null,
      plan: (get(row, 'plan') ?? '').trim() || null,
      monthly_revenue: revenue,
      last_login: lastLogin,
      open_tickets: openTickets,
      failed_payments: failedPayments,
      usage_change_percent: usageChange,
      health_score: health.score,
      health_status: health.status,
      risk_reasons: health.reasons,
    })
  })

  return { customers, errors, totalRows: dataRows.length, columns: Object.keys(columnIndex) }
}
