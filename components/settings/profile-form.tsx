'use client'

import { useState } from 'react'
import { LoaderCircle } from 'lucide-react'

import { updateProfile } from '@/app/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const [name, setName] = useState(initialName)
  const [savingName, setSavingName] = useState(false)
  const [nameMessage, setNameMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function handleName(event: React.FormEvent) {
    event.preventDefault()
    setSavingName(true)
    setNameMessage(null)
    try {
      const result = await updateProfile(name)
      if (result.ok) {
        setName(result.data)
        setNameMessage({ ok: true, text: 'Saved.' })
      } else {
        setNameMessage({ ok: false, text: result.error })
      }
    } catch {
      setNameMessage({ ok: false, text: 'Something went wrong. Please try again.' })
    } finally {
      setSavingName(false)
    }
  }

  async function handlePassword(event: React.FormEvent) {
    event.preventDefault()
    setPasswordMessage(null)
    if (password.length < 8) {
      setPasswordMessage({ ok: false, text: 'Your new password must be at least 8 characters.' })
      return
    }
    if (password !== confirm) {
      setPasswordMessage({ ok: false, text: 'The two passwords do not match.' })
      return
    }
    setSavingPassword(true)
    try {
      const { error } = await createClient().auth.updateUser({ password })
      if (error) {
        setPasswordMessage({ ok: false, text: error.message })
      } else {
        setPassword('')
        setConfirm('')
        setPasswordMessage({ ok: true, text: 'Password updated.' })
      }
    } catch {
      setPasswordMessage({ ok: false, text: 'Something went wrong. Please try again.' })
    } finally {
      setSavingPassword(false)
    }
  }

  const feedback = (message: { ok: boolean; text: string } | null) =>
    message && (
      <p
        role={message.ok ? 'status' : 'alert'}
        className={
          message.ok
            ? 'rounded-md bg-health-green/10 px-3 py-2 text-sm text-health-green'
            : 'rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red'
        }
      >
        {message.text}
      </p>
    )

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleName} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input id="profile-email" value={email} readOnly disabled className="h-10" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="profile-name" className="text-sm font-medium text-foreground">
            Display name
          </label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={80}
            className="h-10"
          />
        </div>
        {feedback(nameMessage)}
        <div>
          <Button type="submit" disabled={savingName}>
            {savingName && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            Save name
          </Button>
        </div>
      </form>

      <form onSubmit={handlePassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-foreground">
            New password
          </label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-10"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
            Confirm new password
          </label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="h-10"
          />
        </div>
        {feedback(passwordMessage)}
        <div>
          <Button type="submit" variant="outline" disabled={savingPassword}>
            {savingPassword && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            Change password
          </Button>
        </div>
      </form>
    </div>
  )
}
