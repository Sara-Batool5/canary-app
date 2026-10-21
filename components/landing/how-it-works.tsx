'use client'

import { useState } from 'react'

import { SectionHeading } from '@/components/landing/section-heading'
import { cn } from '@/lib/utils'

const steps = [
  {
    title: 'Upload',
    body: 'Drop in a CSV of customers, usage and billing, or connect your tools.',
  },
  {
    title: 'Score',
    body: 'Canary calculates a health score and flags what changed for each account.',
  },
  {
    title: 'Review',
    body: 'Work through a ranked list of at-risk accounts with the reasons behind each one.',
  },
  {
    title: 'Reach out',
    body: 'Edit the suggested message and send it from your own inbox.',
  },
]

export function HowItWorks() {
  const [active, setActive] = useState(0)

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          title="From spreadsheet to conversation in four steps"
        />

        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
          <span
            aria-hidden="true"
            className="absolute top-5 bottom-5 left-5 w-px bg-border md:top-5 md:right-[12.5%] md:bottom-auto md:left-[12.5%] md:h-px md:w-auto"
          />
          {steps.map((step, i) => {
            const isActive = i === active
            return (
              <li
                key={step.title}
                aria-current={isActive ? 'step' : undefined}
                onMouseEnter={() => setActive(i)}
                className="relative flex gap-4 md:flex-col md:items-center md:text-center"
              >
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-label={`Step ${i + 1}: ${step.title}`}
                  className={cn(
                    'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background font-heading text-sm font-semibold tabular-nums transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'border-aurora/60 text-aurora shadow-[0_0_24px_-2px_color-mix(in_oklab,var(--accent)_45%,transparent)]'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  {i + 1}
                </button>
                <div className="flex flex-col gap-1.5 pt-1.5 md:px-2 md:pt-2">
                  <h3
                    className={cn(
                      'text-base transition-colors',
                      isActive ? 'text-foreground' : 'text-foreground/80',
                    )}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
