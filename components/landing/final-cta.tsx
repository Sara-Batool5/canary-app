import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="px-4 py-20 md:px-6 md:py-28">
      <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-lg border border-border bg-card/70 px-6 py-16 text-center surface-highlight backdrop-blur-xl md:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-24 size-[480px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--primary)_20%,transparent)_0%,transparent_68%)] blur-2xl" />
          <div className="absolute -right-24 -bottom-48 size-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--accent)_20%,transparent)_0%,transparent_68%)] blur-2xl" />
        </div>
        <div className="mx-auto flex max-w-xl flex-col items-center gap-5">
          <h2
            id="cta-title"
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            Hear the warning while there&apos;s still time
          </h2>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            Upload your customer list and see your first health scores in
            minutes. No credit card needed.
          </p>
          <Link href="/signup" className={cn(buttonVariants(), 'mt-2 h-10 px-4 text-sm')}>
            Get started
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
