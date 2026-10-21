import type { Metadata } from 'next'

import { PageHeader } from '@/components/app-shell/page-header'
import { AttentionTable } from '@/components/dashboard/attention-table'
import { RiskTrendChart } from '@/components/dashboard/risk-trend-chart'
import { StatCards } from '@/components/dashboard/stat-cards'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = { title: 'Dashboard' }

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-muted-foreground">
      <span
        className="h-0.5 w-3 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A snapshot of churn risk across your customer base."
      />
      <div className="flex flex-col gap-6">
        <StatCards />

        <Card className="gap-4 py-6">
          <CardHeader className="flex flex-col gap-3 px-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>At-risk accounts over time</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <LegendItem color="var(--accent)" label="At-risk accounts" />
              <LegendItem color="var(--primary)" label="Revenue at risk" />
            </div>
          </CardHeader>
          <div className="px-4">
            <RiskTrendChart />
          </div>
        </Card>

        <AttentionTable />
      </div>
    </>
  )
}
