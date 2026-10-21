const WIDTH = 72
const HEIGHT = 24
const PADDING = 2

export function Sparkline({ data }: { data: number[] }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = (WIDTH - PADDING * 2) / (data.length - 1)

  const points = data
    .map((value, i) => {
      const x = PADDING + i * step
      const y = PADDING + (1 - (value - min) / range) * (HEIGHT - PADDING * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
      className="shrink-0 overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
