'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CircleAlert,
  CircleCheck,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Upload,
} from 'lucide-react'

import { HealthBadge } from '@/components/health-badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  parseCustomersCsv,
  TEMPLATE_CSV,
  type ParsedCustomer,
  type ParseResult,
} from '@/lib/csv'
import { formatCurrency, formatDate } from '@/lib/format'
import { toBadgeStatus } from '@/lib/health'
import type { ScoringConfig } from '@/lib/scoring'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Mode = 'update' | 'replace' | 'add'
type Existing = { id: string; name: string; email: string | null }
type Done = { mode: Mode; updated: number; added: number }

const norm = (value: string | null | undefined) => (value ?? '').trim().toLowerCase()

/** Match each uploaded row to an existing customer by email first, then by name. */
function matchRows(rows: ParsedCustomer[], existing: Existing[]) {
  const byEmail = new Map<string, string>()
  const byName = new Map<string, string>()
  for (const customer of existing) {
    if (customer.email) byEmail.set(norm(customer.email), customer.id)
    byName.set(norm(customer.name), customer.id)
  }
  const updates = new Map<string, ParsedCustomer>() // last row wins for duplicates
  const inserts: ParsedCustomer[] = []
  const matchedRows = new Set<ParsedCustomer>()
  for (const row of rows) {
    const id = (row.email && byEmail.get(norm(row.email))) || byName.get(norm(row.name))
    if (id) {
      updates.set(id, row)
      matchedRows.add(row)
    } else {
      inserts.push(row)
    }
  }
  return { updates, inserts, matchedRows }
}

function updatePayload(row: ParsedCustomer, columns: string[]) {
  const has = (key: string) => columns.includes(key)
  const payload: Record<string, unknown> = {
    monthly_revenue: row.monthly_revenue,
    last_login: row.last_login,
    health_score: row.health_score,
    health_status: row.health_status,
    risk_reasons: row.risk_reasons,
  }
  if (has('email') && row.email) payload.email = row.email
  if (has('plan') && row.plan) payload.plan = row.plan
  if (has('open_tickets')) payload.open_tickets = row.open_tickets
  if (has('failed_payments')) payload.failed_payments = row.failed_payments
  if (has('usage_change_percent')) payload.usage_change_percent = row.usage_change_percent
  return payload
}

const MODE_OPTIONS: { value: Mode; title: string; text: string }[] = [
  {
    value: 'update',
    title: 'Update existing customers (recommended)',
    text: 'Matches customers by email, or by name, and refreshes their numbers and score. New customers are added. Outcomes and drafted messages are kept. Customers missing from the file are left unchanged.',
  },
  {
    value: 'replace',
    title: 'Replace everything',
    text: 'Removes all current customers, their outcomes and drafted messages first, then imports the file.',
  },
  {
    value: 'add',
    title: 'Add as new customers',
    text: 'Keeps current customers and adds every row as new. Duplicates are not detected.',
  },
]

export function UploadForm({ scoring }: { scoring: ScoringConfig }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [existing, setExisting] = useState<Existing[]>([])
  const [mode, setMode] = useState<Mode>('update')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [done, setDone] = useState<Done | null>(null)

  const customers = result?.customers ?? []
  const errors = result?.errors ?? []

  const match = useMemo(() => matchRows(customers, existing), [customers, existing])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setImportError(null)
    setDone(null)
    setFileName(file.name)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setResult({ customers: [], errors: ['Please choose a .csv file.'], totalRows: 0, columns: [] })
      return
    }
    const text = await file.text()
    setResult(parseCustomersCsv(text, scoring))

    try {
      const supabase = createClient()
      const { data } = await supabase.from('customers').select('id, name, email').limit(5000)
      setExisting((data ?? []) as Existing[])
    } catch {
      setExisting([])
    }
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'canary-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport() {
    if (!result || customers.length === 0) return
    setImporting(true)
    setImportError(null)
    try {
      const supabase = createClient()
      let updated = 0
      let added = 0

      if (mode === 'replace') {
        const { error } = await supabase.from('customers').delete().not('id', 'is', null)
        if (error) throw error
      }

      let toInsert = customers
      if (mode === 'update') {
        const { updates, inserts } = match
        toInsert = inserts
        const entries = Array.from(updates.entries())
        for (let start = 0; start < entries.length; start += 20) {
          const batch = entries.slice(start, start + 20)
          const results = await Promise.all(
            batch.map(([id, row]) =>
              supabase.from('customers').update(updatePayload(row, result.columns)).eq('id', id),
            ),
          )
          const failed = results.find((r) => r.error)
          if (failed?.error) throw failed.error
          updated += batch.length
        }
      }

      for (let start = 0; start < toInsert.length; start += 500) {
        const { error } = await supabase.from('customers').insert(toInsert.slice(start, start + 500))
        if (error) throw error
      }
      added = toInsert.length

      setDone({ mode, updated, added })
      setResult(null)
      setFileName(null)
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setImportError(`The import failed: ${message}`)
    } finally {
      setImporting(false)
    }
  }

  const newCount = match.inserts.length
  const updateCount = match.updates.size

  return (
    <div className="flex flex-col gap-6">
      {done && (
        <Card className="gap-3 px-6 py-5">
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CircleCheck className="size-4 text-health-green" aria-hidden="true" />
            Import complete
          </p>
          <p className="text-sm text-muted-foreground">
            {done.mode === 'update' && `${done.updated} updated · `}
            {done.added} added. Scores are up to date.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard" className={buttonVariants()}>
              View dashboard
            </Link>
            <Link href="/customers" className={buttonVariants({ variant: 'outline' })}>
              View customers
            </Link>
          </div>
        </Card>
      )}

      <Card className="gap-5 py-6">
        <CardHeader className="px-6">
          <CardTitle>Import a CSV</CardTitle>
          <CardDescription>
            Required columns: name, monthly_revenue, last_login. Optional: email, plan,
            open_tickets, failed_payments, usage_change_percent.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-col gap-4 px-6">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              handleFile(e.dataTransfer.files?.[0])
            }}
            className={cn(
              'flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center transition-colors',
              dragging && 'border-primary/60 bg-primary/5',
            )}
          >
            <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">Drag and drop your CSV here</p>
              <p className="text-xs text-muted-foreground">or choose a file from your computer</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              aria-label="Choose CSV file"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download aria-hidden="true" />
                Download template
              </Button>
              <a
                href="/sample-customers.csv"
                download
                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Sample data (40 customers)
              </a>
            </div>
            {fileName && (
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileSpreadsheet className="size-4" aria-hidden="true" />
                {fileName}
              </p>
            )}
          </div>

          {errors.length > 0 && (
            <div
              role="alert"
              className="flex flex-col gap-2 rounded-md bg-health-red/10 px-4 py-3 text-sm text-health-red"
            >
              <p className="flex items-center gap-2 font-medium">
                <CircleAlert className="size-4" aria-hidden="true" />
                {errors.length === 1 ? '1 problem found' : `${errors.length} problems found`}
              </p>
              <ul className="list-disc pl-5">
                {errors.slice(0, 8).map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
              {errors.length > 8 && <p>…and {errors.length - 8} more.</p>}
            </div>
          )}
        </div>
      </Card>

      {customers.length > 0 && (
        <Card className="gap-4 py-6">
          <CardHeader className="px-6">
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              {customers.length} customer{customers.length === 1 ? '' : 's'} ready to import
              {errors.length > 0 ? ` (${errors.length} skipped because of problems)` : ''}.
              {mode === 'update' && ` ${updateCount} will be updated and ${newCount} added.`} Showing
              the first 8.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 font-medium">Customer</th>
                  {mode === 'update' && <th className="px-3 py-2.5 font-medium">Action</th>}
                  <th className="px-3 py-2.5 font-medium">Plan</th>
                  <th className="px-3 py-2.5 text-right font-medium">Monthly revenue</th>
                  <th className="px-3 py-2.5 font-medium">Last login</th>
                  <th className="px-3 py-2.5 text-right font-medium">Score</th>
                  <th className="px-6 py-2.5 font-medium">Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.slice(0, 8).map((customer, index) => (
                  <tr key={`${customer.name}-${index}`}>
                    <td className="px-6 py-3 font-medium text-foreground">{customer.name}</td>
                    {mode === 'update' && (
                      <td className="px-3 py-3 text-muted-foreground">
                        {match.matchedRows.has(customer) ? 'Update' : 'New'}
                      </td>
                    )}
                    <td className="px-3 py-3 text-muted-foreground">{customer.plan ?? '—'}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">
                      {formatCurrency(customer.monthly_revenue)}
                    </td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {formatDate(customer.last_login)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground">
                      {customer.health_score}
                    </td>
                    <td className="px-6 py-3">
                      <HealthBadge status={toBadgeStatus(customer.health_status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 px-6">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-1 text-sm font-medium text-foreground">
                What should happen to your existing customers?
              </legend>
              {MODE_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === option.value}
                    onChange={() => setMode(option.value)}
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="font-medium text-foreground">{option.title}.</span> {option.text}
                  </span>
                </label>
              ))}
            </fieldset>

            {importError && (
              <p role="alert" className="rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red">
                {importError}
              </p>
            )}

            <div>
              <Button size="lg" className="h-10" onClick={handleImport} disabled={importing}>
                {importing && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {importing
                  ? 'Importing…'
                  : mode === 'update'
                    ? `Update ${updateCount}, add ${newCount}`
                    : `Import ${customers.length} customers`}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
