'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CircleAlert, Download, FileSpreadsheet, LoaderCircle, Upload } from 'lucide-react'

import { HealthBadge } from '@/components/health-badge'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/format'
import { toBadgeStatus } from '@/lib/health'
import { parseCustomersCsv, TEMPLATE_CSV, type ParseResult } from '@/lib/csv'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Mode = 'replace' | 'add'

export function UploadForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<ParseResult | null>(null)
  const [mode, setMode] = useState<Mode>('replace')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setImportError(null)
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFileName(file.name)
      setResult({ customers: [], errors: ['Please choose a .csv file.'], totalRows: 0 })
      return
    }
    setFileName(file.name)
    const text = await file.text()
    setResult(parseCustomersCsv(text))
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
    if (!result || result.customers.length === 0) return
    setImporting(true)
    setImportError(null)
    try {
      const supabase = createClient()

      if (mode === 'replace') {
        const { error } = await supabase.from('customers').delete().not('id', 'is', null)
        if (error) throw error
      }

      const rows = result.customers
      for (let start = 0; start < rows.length; start += 500) {
        const { error } = await supabase.from('customers').insert(rows.slice(start, start + 500))
        if (error) throw error
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setImportError(`The import failed: ${message}`)
      setImporting(false)
    }
  }

  const customers = result?.customers ?? []
  const errors = result?.errors ?? []

  return (
    <div className="flex flex-col gap-6">
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
              <p className="text-sm font-medium text-foreground">
                Drag and drop your CSV here
              </p>
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
              {errors.length > 0 ? ` (${errors.length} skipped because of problems)` : ''}. Showing
              the first 8.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-y border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-2.5 font-medium">Customer</th>
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
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium text-foreground">
                What should happen to your existing customers?
              </legend>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'replace'}
                  onChange={() => setMode('replace')}
                  className="mt-1 accent-[var(--primary)]"
                />
                <span>
                  <span className="font-medium text-foreground">Replace them</span> (recommended).
                  Removes current customers and their drafted messages first.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === 'add'}
                  onChange={() => setMode('add')}
                  className="mt-1 accent-[var(--primary)]"
                />
                <span>
                  <span className="font-medium text-foreground">Add to them.</span> Keeps current
                  customers. Duplicates are not detected.
                </span>
              </label>
            </fieldset>

            {importError && (
              <p role="alert" className="rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red">
                {importError}
              </p>
            )}

            <div>
              <Button size="lg" className="h-10" onClick={handleImport} disabled={importing}>
                {importing && <LoaderCircle className="animate-spin" aria-hidden="true" />}
                {importing ? 'Importing…' : `Import ${customers.length} customers`}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
