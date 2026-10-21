'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeading } from '@/components/landing/section-heading'

const faqs = [
  {
    q: 'What data do I need?',
    a: 'A list of customers with their plan and revenue is enough to start. Adding last login dates, usage counts, support tickets and payment status makes the health score much more accurate.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your data is encrypted in transit and at rest, is only visible to people on your team, and is never used to train AI models. You can delete it at any time.',
  },
  {
    q: 'How is the health score calculated?',
    a: 'Canary weighs recent activity, usage trends, support volume and billing events into a single 0–100 score. Each account shows the specific signals that moved its score, so nothing is a black box.',
  },
  {
    q: 'Can I edit the AI messages?',
    a: 'Yes. Every message is a draft. You can rewrite it, change the tone, or start from scratch before it goes anywhere.',
  },
  {
    q: 'Does Canary send emails automatically?',
    a: 'No. Canary never sends anything automatically. You review every message and send it yourself, from your own inbox.',
  },
]

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-12">
        <SectionHeading
          id="faq-title"
          eyebrow="FAQ"
          title="Questions, answered"
        />
        <Accordion className="rounded-lg border border-border bg-card/60 px-5 backdrop-blur">
          {faqs.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-border">
              <AccordionTrigger className="py-4 text-base text-foreground hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
