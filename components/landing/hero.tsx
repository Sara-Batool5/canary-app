import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { ProductPreview } from '@/components/landing/product-preview'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section className="px-4 pt-16 pb-12 md:px-6 md:pt-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <span className="size-1.5 rounded-full bg-muted-foreground" aria-hidden="true" />
          Churn early-warning for SaaS teams
        </p>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
          Spot churn before it happens
        </h1>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
          Canary watches for warning signs like inactivity, rising support
          tickets and failed payments, so you can step in while there&apos;s
          still time.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className={cn(buttonVariants(), 'h-10 px-4 text-sm')}
          >
            Get started
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
          <a
            href="#how-it-works"
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-10 bg-transparent px-4 text-sm',
            )}
          >
            See how it works
          </a>
        </div>
      </div>

      <div className="mt-16 md:mt-20">
        <ProductPreview />
      </div>
    </section>
  )
}
