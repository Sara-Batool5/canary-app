import type { Metadata } from 'next'
import { Settings } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { PlaceholderCard } from '@/components/app-shell/placeholder-card'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your workspace, team, and risk thresholds."
      />
      <PlaceholderCard
        icon={Settings}
        title="Workspace settings"
        description="Profile, team members, and alert preferences will be configurable here."
      />
    </>
  )
}
