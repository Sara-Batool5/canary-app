'use client'

import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Menu, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ProfileMenu } from '@/components/app-shell/profile-menu'
import { SidebarContent } from '@/components/app-shell/sidebar-content'
import { notificationCount } from '@/lib/mock-data'
import type { AppUser } from '@/lib/user'
import { getPageTitle } from '@/lib/navigation'

export function Topbar({ user }: { user: AppUser }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/70 px-4 backdrop-blur-xl md:px-6">
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open navigation menu"
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 border-border bg-card/90 p-0 backdrop-blur-xl"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent
            user={user}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <p className="min-w-0 shrink-0 truncate font-heading text-base font-semibold tracking-tight text-foreground md:w-40">
        {getPageTitle(pathname)}
      </p>

      <div className="flex flex-1 justify-center">
        <form
          role="search"
          className="relative hidden w-full max-w-md sm:block"
          onSubmit={(e) => {
            e.preventDefault()
            const q = String(new FormData(e.currentTarget).get('q') ?? '').trim()
            router.push(q ? `/customers?q=${encodeURIComponent(q)}` : '/customers')
          }}
        >
          <label htmlFor="global-search" className="sr-only">
            Search customers
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="global-search"
            name="q"
            type="search"
            placeholder="Search customers, accounts…"
            className="h-9 bg-background/40 pl-9"
          />
        </form>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label={`Notifications, ${notificationCount} unread`}
        >
          <Bell />
          {notificationCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-aurora ring-2 ring-card"
              aria-hidden="true"
            />
          )}
        </Button>
        <ProfileMenu user={user} />
      </div>
    </header>
  )
}
