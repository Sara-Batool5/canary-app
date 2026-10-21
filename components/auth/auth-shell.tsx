import { AuroraBackground } from '@/components/app-shell/aurora-background'
import { Logo } from '@/components/app-shell/logo'

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center px-4 py-10">
      <AuroraBackground />
      <main className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-border bg-card/70 p-8 surface-highlight backdrop-blur-xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <Logo href="/" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl text-foreground">{title}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
