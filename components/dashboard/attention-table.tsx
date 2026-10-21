import Link from 'next/link'

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthBadge } from '@/components/health-badge'
import { formatCurrency } from '@/lib/format'
import { toBadgeStatus } from '@/lib/health'

export type AttentionAccount = {
  id: string
  name: string
  plan: string | null
  monthly_revenue: number
  health_status: string
  risk_reasons: string[] | null
}

export function AttentionTable({ accounts }: { accounts: AttentionAccount[] }) {
  return (
    <Card className="gap-4 py-6">
      <CardHeader className="px-6">
        <CardTitle>Needs attention now</CardTitle>
        <CardDescription>
          The accounts most at risk, with the largest revenue first.
        </CardDescription>
      </CardHeader>

      {accounts.length === 0 ? (
        <p className="px-6 pb-2 text-sm text-muted-foreground">
          Great news: none of your customers are at risk right now.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="px-6 py-2.5 font-medium">Customer</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Plan</th>
                <th scope="col" className="px-3 py-2.5 text-right font-medium">Monthly revenue</th>
                <th scope="col" className="px-3 py-2.5 font-medium">Main risk reason</th>
                <th scope="col" className="px-6 py-2.5 font-medium">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {accounts.map((account) => (
                <tr key={account.id} className="transition-colors hover:bg-foreground/3">
                  <th scope="row" className="px-6 py-3 text-left font-medium text-foreground">
                    <Link
                      href={`/customers/${account.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {account.name}
                    </Link>
                  </th>
                  <td className="px-3 py-3 text-muted-foreground">{account.plan ?? '—'}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground">
                    {formatCurrency(account.monthly_revenue)}
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    {account.risk_reasons?.[0] ?? '—'}
                  </td>
                  <td className="px-6 py-3">
                    <HealthBadge status={toBadgeStatus(account.health_status)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
