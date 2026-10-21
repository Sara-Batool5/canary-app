'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/app-shell/logo'
import { signOut } from '@/app/actions/auth'
import type { AppUser } from '@/lib/user'
import { navItems } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function SidebarContent({
  user,
  onNavigate,
}: {
  user: AppUser
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo />
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-foreground/6 text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary'
                      : 'text-muted-foreground hover:bg-foreground/4 hover:text-foreground',
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3 border-t border-border p-4">
        <Avatar>
          <AvatarFallback className="border border-border bg-card text-xs font-medium text-foreground">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {user.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Log out"
          disabled={isPending}
          onClick={() => startTransition(async () => { await signOut() })}
        >
          <LogOut />
        </Button>
      </div>
    </div>
  )
}
