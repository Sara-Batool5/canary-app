import type { Metadata } from 'next'
import { FileBarChart } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { PlaceholderCard } from '@/components/app-shell/placeholder-card'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Retention, churn, and save-rate reports for your team."
      />
      <PlaceholderCard
        icon={FileBarChart}
        title="Reports are on the way"
        description="Scheduled and exportable reports will appear here."
      />
    </>
  )
}
