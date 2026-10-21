import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { statusColors, statusLabels } from '@/lib/health'
import type { DbStatus } from '@/lib/scoring'

type Segment = { status: DbStatus; count: number; revenue: number }

export function HealthDistribution({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0)

  return (
    <Card className="gap-5 py-6">
      <CardHeader className="px-6">
        <CardTitle>Health breakdown</CardTitle>
        <CardDescription>How your {total} customers are doing right now.</CardDescription>
      </CardHeader>

      <div className="flex flex-col gap-6 px-6">
        <div
          className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
          role="img"
          aria-label={segments
            .map((s) => `${statusLabels[s.status]}: ${s.count}`)
            .join(', ')}
        >
          {segments.map((segment) =>
            segment.count > 0 ? (
              <div
                key={segment.status}
                style={{
                  width: `${(segment.count / total) * 100}%`,
                  backgroundColor: statusColors[segment.status],
                }}
              />
            ) : null,
          )}
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {segments.map((segment) => (
            <li key={segment.status} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: statusColors[segment.status] }}
                  aria-hidden="true"
                />
                {statusLabels[segment.status]}
              </span>
              <span className="font-heading text-2xl font-semibold tabular-nums text-foreground">
                {segment.count}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatCurrency(segment.revenue)} monthly revenue
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
