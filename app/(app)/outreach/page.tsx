import type { Metadata } from 'next'
import { Send } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { PlaceholderCard } from '@/components/app-shell/placeholder-card'

export const metadata: Metadata = { title: 'Outreach' }

export default function OutreachPage() {
  return (
    <>
      <PageHeader
        title="Outreach"
        description="Plan and track save campaigns for at-risk customers."
      />
      <PlaceholderCard
        icon={Send}
        title="No campaigns yet"
        description="Outreach sequences and playbooks will live here."
      />
    </>
  )
}
