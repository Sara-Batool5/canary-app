import Link from 'next/link'

import { CanaryMark } from '@/components/app-shell/logo-mark'

export function Logo({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-background">
        <CanaryMark className="size-6" />
      </span>
      <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
        Canary
      </span>
    </Link>
  )
}
