import Link from 'next/link'
import { Bird } from 'lucide-react'

export function Logo({ href = '/dashboard' }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Bird className="size-5 text-foreground" aria-hidden="true" />
      <span className="font-heading text-lg font-semibold tracking-tight text-foreground">
        Canary
      </span>
    </Link>
  )
}
