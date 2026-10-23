'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'signup'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)

const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL
const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD

function friendlyError(message: string) {
  const text = message.toLowerCase()
  if (text.includes('invalid login credentials'))
    return 'Incorrect email or password. Please try again.'
  if (text.includes('email not confirmed'))
    return 'Please confirm your email first. Check your inbox for the link.'
  if (text.includes('already registered'))
    return 'An account with this email already exists. Try logging in instead.'
  if (text.includes('rate limit') || text.includes('too many'))
    return 'Too many attempts. Please wait a minute and try again.'
  return message
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const isSignup = mode === 'signup'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)

    const cleanEmail = email.trim()
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }
    if (!isConfigured) {
      setError(
        'Supabase is not configured yet. Add the environment variables and redeploy.',
      )
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        })
        if (signUpError) {
          setError(friendlyError(signUpError.message))
          return
        }
        if (data.user && data.user.identities?.length === 0) {
          setError(
            'An account with this email already exists. Try logging in instead.',
          )
          return
        }
        if (data.session) {
          router.replace('/dashboard')
          router.refresh()
          return
        }
        setNotice(
          'Check your email to confirm your account, then come back and log in.',
        )
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })
      if (signInError) {
        setError(friendlyError(signInError.message))
        return
      }
      router.replace('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemo() {
    if (!demoEmail || !demoPassword) return
    setError(null)
    setNotice(null)
    setLoading(true)
    try {
      const { error: demoError } = await createClient().auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      })
      if (demoError) {
        setError(friendlyError(demoError.message))
        return
      }
      router.replace('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md bg-health-red/10 px-3 py-2 text-sm text-health-red"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="rounded-md bg-health-green/10 px-3 py-2 text-sm text-health-green"
          >
            {notice}
          </p>
        )}

        <Button type="submit" size="lg" className="h-10 w-full" disabled={loading}>
          {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
          {loading
            ? isSignup
              ? 'Creating account…'
              : 'Logging in…'
            : isSignup
              ? 'Create account'
              : 'Log in'}
        </Button>
      </form>

      {!isSignup && demoEmail && demoPassword && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-10 w-full"
          onClick={handleDemo}
          disabled={loading}
        >
          Explore with the demo account
        </Button>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? 'Already have an account?' : 'New to Canary?'}{' '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {isSignup ? 'Log in' : 'Create an account'}
        </Link>
      </p>
    </div>
  )
}
