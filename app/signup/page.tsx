import type { Metadata } from 'next'

import { AuthForm } from '@/components/auth/auth-form'
import { AuthShell } from '@/components/auth/auth-shell'

export const metadata: Metadata = { title: 'Get started' }

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your account"
      description="Start spotting churn before it happens."
    >
      <AuthForm mode="signup" />
    </AuthShell>
  )
}
