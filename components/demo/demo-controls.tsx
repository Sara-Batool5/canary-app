'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, Sparkles, Trash2 } from 'lucide-react'

import { clearAllData, loadDemoData } from '@/app/actions/demo'
import { Button } from '@/components/ui/button'

export function LoadDemoButton({
  variant = 'outline',
  size = 'lg',
}: {
  variant?: 'default' | 'outline'
  size?: 'default' | 'lg'
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setBusy(true)
    setError(null)
    try {
      const result = await loadDemoData()
      if (result.ok) router.refresh()
      else setError(result.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant={variant} size={size} onClick={handleClick} disabled={busy}>
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles aria-hidden="true" />
        )}
        {busy ? 'Loading demo…' : 'Load demo data'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-health-red">
          {error}
        </p>
      )}
    </div>
  )
}

export function ClearDataButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (
      !window.confirm(
        'Delete all customers, outcomes and drafted messages? This cannot be undone.',
      )
    )
      return
    setBusy(true)
    setError(null)
    try {
      const result = await clearAllData()
      if (result.ok) router.refresh()
      else setError(result.error)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button variant="outline" onClick={handleClick} disabled={busy}>
        {busy ? (
          <LoaderCircle className="animate-spin" aria-hidden="true" />
        ) : (
          <Trash2 aria-hidden="true" />
        )}
        {busy ? 'Deleting…' : 'Delete all my data'}
      </Button>
      {error && (
        <p role="alert" className="text-sm text-health-red">
          {error}
        </p>
      )}
    </div>
  )
}
