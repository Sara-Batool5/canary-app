export function CanaryMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="canary-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B99CF6" />
          <stop offset="1" stopColor="#8760E6" />
        </linearGradient>
      </defs>
      <path d="M17 35 L3 26 L6 37 L3 48 L19 43 Z" fill="#7F59DD" />
      <ellipse cx="31" cy="37" rx="17" ry="13.5" fill="url(#canary-body)" />
      <circle cx="44" cy="26" r="10" fill="url(#canary-body)" />
      <path d="M21 35 C25 27 37 27 41 36 C35 43 26 43 21 35 Z" fill="#5AD8D4" />
      <path d="M53 22 L62 26.5 L53 31 Z" fill="#F7B23B" />
      <circle cx="47.5" cy="24" r="2" fill="#0A0C1A" />
      <circle cx="48.2" cy="23.3" r="0.6" fill="#EBECF4" />
      <path d="M49 14 Q55 14 57 20" fill="none" stroke="#5AD8D4" strokeWidth="2" strokeLinecap="round" />
      <path d="M47 8 Q59 8 61 20" fill="none" stroke="#5AD8D4" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  )
}
