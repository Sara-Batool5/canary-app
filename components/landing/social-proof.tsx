const wordmarks = [
  { name: 'Northwind', className: 'font-heading font-semibold tracking-tight' },
  { name: 'LUMEN', className: 'font-sans font-bold tracking-[0.2em]' },
  { name: 'fieldnote', className: 'font-heading font-medium lowercase' },
  { name: 'Orbital', className: 'font-sans font-semibold italic' },
  { name: 'PAPERCRANE', className: 'font-heading font-medium tracking-widest text-sm' },
]

export function SocialProof() {
  return (
    <section aria-label="Who Canary is for" className="px-4 py-12 md:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8">
        <p className="text-center text-sm text-muted-foreground">
          Built for customer success, revenue and product teams
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14">
          {wordmarks.map((mark) => (
            <li
              key={mark.name}
              className={`text-lg text-muted-foreground/60 ${mark.className}`}
            >
              {mark.name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
