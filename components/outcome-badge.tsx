import { cn } from '@/lib/utils'

export function OutcomeBadge({ result }: { result: 'saved' | 'churned' | string }) {
  const saved = result === 'saved'
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        saved ? 'bg-health-green/15 text-health-green' : 'bg-foreground/8 text-muted-foreground',
      )}
    >
      <span
        className={cn('size-1.5 rounded-full', saved ? 'bg-health-green' : 'bg-muted-foreground')}
        aria-hidden="true"
      />
      {saved ? 'Saved' : 'Churned'}
    </span>
  )
}
