import type { Metadata } from 'next'

import { PageHeader } from '@/components/app-shell/page-header'
import { ClearDataButton, LoadDemoButton } from '@/components/demo/demo-controls'
import { ProfileForm } from '@/components/settings/profile-form'
import { ScoringForm } from '@/components/settings/scoring-form'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getScoringConfig } from '@/lib/customers'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL?.toLowerCase()
  const isDemo = Boolean(demoEmail) && user?.email?.toLowerCase() === demoEmail

  const name =
    typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account and decide what counts as a warning sign."
      />
      <div className="flex flex-col gap-6">
        <Card className="gap-5 py-6">
          <CardHeader className="px-6">
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your name appears in the sidebar and profile menu.</CardDescription>
          </CardHeader>
          <div className="px-6">
            <ProfileForm initialName={name} email={user?.email ?? ''} lockPassword={isDemo} />
          </div>
        </Card>

        <Card className="gap-5 py-6">
          <CardHeader className="px-6">
            <CardTitle>Scoring rules</CardTitle>
            <CardDescription>
              Every customer starts at 100 and loses points for warning signs. Change the rules to
              match your business. Scores update everywhere as soon as you save.
            </CardDescription>
          </CardHeader>
          <div className="px-6">
            <ScoringForm initial={getScoringConfig(user)} />
          </div>
        </Card>

        <Card className="gap-5 py-6">
          <CardHeader className="px-6">
            <CardTitle>Your data</CardTitle>
            <CardDescription>
              Load a ready-made demo to explore Canary, or clear everything and start fresh.
              Demo data can only be loaded when you have no customers.
            </CardDescription>
          </CardHeader>
          <div className="flex flex-wrap items-start gap-3 px-6">
            <LoadDemoButton size="default" />
            <ClearDataButton />
          </div>
        </Card>
      </div>
    </>
  )
}
