export function LandingBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1400px] overflow-hidden"
    >
      <div className="dot-grid absolute inset-0" />
      <div className="aurora-blob aurora-lavender-lg" />
      <div className="aurora-blob aurora-teal-lg" />
    </div>
  )
}
