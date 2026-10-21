import type { User } from '@supabase/supabase-js'

export type AppUser = {
  name: string
  email: string
  initials: string
}

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

export function toAppUser(user: User): AppUser {
  const email = user.email ?? ''
  const metaName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : ''
  const name = metaName || titleCase(email.split('@')[0] ?? '') || 'Account'
  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'U'

  return { name, email, initials }
}
