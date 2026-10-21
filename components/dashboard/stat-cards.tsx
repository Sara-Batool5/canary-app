import { Card } from '@/components/ui/card'

export type Stat = {
  label: string
  value: string
  caption: string
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <li key={stat.label}>
          <Card className="h-full gap-3 px-5 py-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.caption}</p>
          </Card>
        </li>
      ))}
    </ul>
  )
}
