import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { HealthBadge } from '@/components/health-badge'
import { attentionAccounts } from '@/lib/mock-data'

export function AttentionTable() {
  return (
    <Card className="gap-4 py-6">
      <CardHeader className="px-6">
        <CardTitle>Needs attention now</CardTitle>
        <CardDescription>
          Accounts with the highest churn risk this week.
        </CardDescription>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-y border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="px-6 py-2.5 font-medium">
                Customer
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Plan
              </th>
              <th scope="col" className="px-3 py-2.5 text-right font-medium">
                Monthly revenue
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">
                Main risk reason
              </th>
              <th scope="col" className="px-6 py-2.5 font-medium">
                Health
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {attentionAccounts.map((account) => (
              <tr
                key={account.name}
                className="transition-colors hover:bg-foreground/3"
              >
                <th
                  scope="row"
                  className="px-6 py-3 text-left font-medium text-foreground"
                >
                  {account.name}
                </th>
                <td className="px-3 py-3 text-muted-foreground">
                  {account.plan}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-foreground">
                  {account.mrr}
                </td>
                <td className="px-3 py-3 text-muted-foreground">
                  {account.reason}
                </td>
                <td className="px-6 py-3">
                  <HealthBadge status={account.health} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
