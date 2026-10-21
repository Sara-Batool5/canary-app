export function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="aurora-blob aurora-lavender" />
      <div className="aurora-blob aurora-teal" />
    </div>
  )
}
