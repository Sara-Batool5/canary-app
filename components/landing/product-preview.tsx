import { Sparkline } from '@/components/dashboard/sparkline'
import { dashboardStats } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const trend = [38, 41, 40, 46, 44, 52, 50, 57, 61, 58, 66, 72]
const months = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']

const W = 600
const H = 180

function buildPaths(data: number[]) {
  const max = Math.max(...data) * 1.1
  const step = W / (data.length - 1)
  const points = data.map((v, i) => [i * step, H - (v / max) * H] as const)
  const line = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ')
  return { line, area: `${line} L${W},${H} L0,${H} Z` }
}

function AreaChart() {
  const { line, area } = buildPaths(trend)
  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-40 sm:h-48">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="preview-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1="0"
              x2={W}
              y1={H * f}
              y2={H * f}
              stroke="var(--border)"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={area} fill="url(#preview-area)" />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

export function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div
        aria-hidden="true"
        className="glow-teal absolute -inset-x-10 top-1/4 -z-10 h-3/4"
      />
      <figure
        className="relative overflow-hidden rounded-lg border border-border bg-card/80 shadow-2xl shadow-background surface-highlight backdrop-blur-xl"
        aria-label="Preview of the Canary dashboard"
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
            <span className="size-2.5 rounded-full bg-border" />
          </div>
          <span className="text-xs text-muted-foreground">
            app.canary.io/dashboard
          </span>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-heading text-base font-semibold tracking-tight text-foreground">
              Dashboard
            </p>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </div>

          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {dashboardStats.map((stat, i) => (
              <li
                key={stat.label}
                className={cn(
                  'flex flex-col gap-2 rounded-lg border border-border bg-background/40 p-3 sm:p-4',
                  i > 1 && 'hidden sm:flex',
                )}
              >
                <p className="truncate text-xs text-muted-foreground">
                  {stat.label}
                </p>
                <div className="flex items-end justify-between gap-2">
                  <p className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {stat.value}
                  </p>
                  <div className="hidden sm:block">
                    <Sparkline data={stat.spark} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="mb-4 text-sm font-medium text-foreground">
              At-risk accounts over time
            </p>
            <AreaChart />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background"
        />
      </figure>
    </div>
  )
}
