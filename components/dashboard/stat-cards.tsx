import { Card } from '@/components/ui/card'
import { Sparkline } from '@/components/dashboard/sparkline'
import { dashboardStats } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

export function StatCards() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {dashboardStats.map((stat) => (
        <li key={stat.label}>
          <Card className="gap-3 px-5 py-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-end justify-between gap-3">
              <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {stat.value}
              </p>
              <Sparkline data={stat.spark} />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
                  stat.trend === 'positive'
                    ? 'bg-health-green/10 text-health-green'
                    : 'bg-health-red/10 text-health-red',
                )}
              >
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}
