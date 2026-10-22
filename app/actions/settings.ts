'use server'

import { revalidatePath } from 'next/cache'

import { DEFAULT_SCORING, normalizeScoring, type ScoringConfig } from '@/lib/scoring'
import { createClient } from '@/lib/supabase/server'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function saveScoring(raw: unknown): Promise<Result<ScoringConfig>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const config = normalizeScoring(raw)
  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, scoring: config },
  })
  if (error) return { ok: false, error: `Could not save: ${error.message}` }

  revalidatePath('/', 'layout')
  return { ok: true, data: config }
}

export async function resetScoring(): Promise<Result<ScoringConfig>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, scoring: null },
  })
  if (error) return { ok: false, error: `Could not reset: ${error.message}` }

  revalidatePath('/', 'layout')
  return { ok: true, data: DEFAULT_SCORING }
}

export async function updateProfile(name: string): Promise<Result<string>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const clean = name.trim().slice(0, 80)
  const { error } = await supabase.auth.updateUser({
    data: { ...user.user_metadata, full_name: clean },
  })
  if (error) return { ok: false, error: `Could not save: ${error.message}` }

  revalidatePath('/', 'layout')
  return { ok: true, data: clean }
}
