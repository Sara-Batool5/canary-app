import { redirect } from 'next/navigation'

import { AuroraBackground } from '@/components/app-shell/aurora-background'
import { SidebarContent } from '@/components/app-shell/sidebar-content'
import { Topbar } from '@/components/app-shell/topbar'
import { getScoringConfig } from '@/lib/customers'
import { getNotifications } from '@/lib/notifications'
import { createClient } from '@/lib/supabase/server'
import { toAppUser } from '@/lib/user'

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const appUser = toAppUser(user)
  const notifications = await getNotifications(supabase, getScoringConfig(user))

  return (
    <div className="relative isolate min-h-dvh">
      <AuroraBackground />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card/70 backdrop-blur-xl lg:block">
        <SidebarContent user={appUser} />
      </aside>
      <div className="flex min-h-dvh flex-col lg:pl-64">
        <Topbar user={appUser} notifications={notifications} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
