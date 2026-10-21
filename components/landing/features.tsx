import { Activity, CircleDollarSign, MessageSquareText } from 'lucide-react'

import { SectionHeading } from '@/components/landing/section-heading'

const features = [
  {
    icon: Activity,
    title: 'Health scoring',
    body: 'Every account gets a 0–100 score from logins, usage, tickets and billing. Updated each time you upload new data.',
  },
  {
    icon: CircleDollarSign,
    title: 'Revenue at risk',
    body: 'See exactly how much recurring revenue sits in amber and red accounts, so you know where to spend your time first.',
  },
  {
    icon: MessageSquareText,
    title: 'AI-written outreach',
    body: 'Get a personal draft for each at-risk customer that references what actually changed. Edit it, then send it yourself.',
  },
]

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-12">
        <SectionHeading
          id="features-title"
          eyebrow="Features"
          title="Everything you need to keep customers"
          description="Canary turns the data you already have into a short list of accounts worth a conversation."
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card/60 p-6 surface-highlight backdrop-blur transition-colors duration-200 hover:border-primary/30"
            >
              <span className="flex size-9 items-center justify-center rounded-md border border-border bg-background/50">
                <Icon className="size-4 text-foreground" aria-hidden="true" />
              </span>
              <h3 className="text-lg text-foreground">{title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
