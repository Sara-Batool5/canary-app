import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Log in' }

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Log in to your Canary workspace."
    >
      <AuthForm mode="login" />
    </AuthShell>
  )
}
