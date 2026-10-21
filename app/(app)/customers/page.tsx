import type { Metadata } from 'next'
import { Users } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { PlaceholderCard } from '@/components/app-shell/placeholder-card'
import { HealthBadge } from '@/components/health-badge'
import { sampleCustomers } from '@/lib/mock-data'

export const metadata: Metadata = { title: 'Customers' }

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Customers"
        description="Every account, ranked by health and churn risk."
      />
      <PlaceholderCard
        icon={Users}
        title="Customer list coming soon"
        description="A preview of how accounts and health badges will appear."
      >
        <ul className="divide-y divide-border rounded-lg border border-border">
          {sampleCustomers.map((customer) => (
            <li
              key={customer.name}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {customer.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customer.mrr} MRR
                </p>
              </div>
              <HealthBadge status={customer.health} />
            </li>
          ))}
        </ul>
      </PlaceholderCard>
    </>
  )
}
