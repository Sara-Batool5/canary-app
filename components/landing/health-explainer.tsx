import { SectionHeading } from '@/components/landing/section-heading'
import { cn } from '@/lib/utils'

const statuses = [
  {
    label: 'Healthy',
    range: '70–100',
    dot: 'bg-health-green',
    text: 'text-health-green',
    example: 'Logged in 5 times this week and added two teammates',
  },
  {
    label: 'Watch',
    range: '40–69',
    dot: 'bg-health-amber',
    text: 'text-health-amber',
    example: 'Usage down 35% this month and 3 open support tickets',
  },
  {
    label: 'At risk',
    range: '0–39',
    dot: 'bg-health-red',
    text: 'text-health-red',
    example: 'Hasn’t logged in for 21 days and a payment just failed',
  },
]

export function HealthExplainer() {
  return (
    <section aria-labelledby="health-title" className="px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <SectionHeading
          id="health-title"
          eyebrow="Health status"
          title="Three colours, no guesswork"
          description="Every customer lands in one of three groups, with the reason written in plain language."
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {statuses.map((s) => (
            <li
              key={s.label}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card/60 p-5 surface-highlight backdrop-blur"
            >
              <div className="flex items-center justify-between gap-3">
                <span className={cn('inline-flex items-center gap-2 text-sm font-medium', s.text)}>
                  <span className={cn('size-2 rounded-full', s.dot)} aria-hidden="true" />
                  {s.label}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  Score {s.range}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {`“${s.example}”`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
