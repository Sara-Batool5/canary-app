'use client'

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { riskTrend } from '@/lib/mock-data'

const chartConfig = {
  atRisk: { label: 'At-risk accounts', color: 'var(--accent)' },
  revenueAtRisk: { label: 'Revenue at risk ($k)', color: 'var(--primary)' },
} satisfies ChartConfig

export function RiskTrendChart() {
  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ComposedChart data={riskTrend} margin={{ top: 8, left: 4, right: 4 }}>
        <defs>
          <linearGradient id="atRiskFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="var(--border)"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
        />
        <YAxis yAxisId="count" hide domain={[0, 'dataMax + 6']} />
        <YAxis yAxisId="revenue" hide domain={[0, 'dataMax + 60']} />
        <ChartTooltip
          cursor={{ stroke: 'var(--border)' }}
          content={
            <ChartTooltipContent
              indicator="line"
              className="border-border bg-card"
            />
          }
        />
        <Area
          yAxisId="count"
          dataKey="atRisk"
          type="monotone"
          stroke="var(--color-atRisk)"
          strokeWidth={2}
          fill="url(#atRiskFill)"
          dot={false}
          activeDot={{ r: 3 }}
        />
        <Line
          yAxisId="revenue"
          dataKey="revenueAtRisk"
          type="monotone"
          stroke="var(--color-revenueAtRisk)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3 }}
        />
      </ComposedChart>
    </ChartContainer>
  )
}
