'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CircleCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AppNotification } from '@/lib/notifications'

const STORAGE_KEY = 'canary-notifications-seen'

const TONE_COLORS: Record<AppNotification['tone'], string> = {
  red: 'var(--health-red)',
  amber: 'var(--health-amber)',
  green: 'var(--health-green)',
  info: 'var(--primary)',
}

export function NotificationsMenu({ notifications }: { notifications: AppNotification[] }) {
  const router = useRouter()
  const signature = notifications.map((n) => `${n.id}:${n.count}`).join('|')

  const [seen, setSeen] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      setSeen(window.localStorage.getItem(STORAGE_KEY))
    } catch {
      // Storage can be unavailable; the dot simply stays visible.
    }
    setReady(true)
  }, [])

  const unread = ready && notifications.length > 0 && seen !== signature

  function markSeen() {
    try {
      window.localStorage.setItem(STORAGE_KEY, signature)
    } catch {
      // Ignore storage errors.
    }
    setSeen(signature)
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && markSeen()}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label={
              unread
                ? `Notifications, ${notifications.length} new`
                : 'Notifications'
            }
          />
        }
      >
        <Bell />
        {unread && (
          <span
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-aurora ring-2 ring-card"
            aria-hidden="true"
          />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-sm font-medium text-foreground">
            Notifications
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {notifications.length === 0 ? (
          <div className="flex items-center gap-2 px-2 py-4 text-sm text-muted-foreground">
            <CircleCheck className="size-4 text-health-green" aria-hidden="true" />
            You&apos;re all caught up.
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => router.push(notification.href)}
              className="items-start gap-3 py-2.5"
            >
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: TONE_COLORS[notification.tone] }}
                aria-hidden="true"
              />
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{notification.title}</span>
                <span className="text-xs text-muted-foreground">{notification.description}</span>
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
