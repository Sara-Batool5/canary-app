export function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">
        {title}
      </h1>
      <p className="text-sm text-pretty text-muted-foreground">{description}</p>
    </div>
  )
}
