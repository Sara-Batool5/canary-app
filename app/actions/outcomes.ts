'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type OutcomeResult = 'saved' | 'churned'
export type OutcomeRow = { result: OutcomeResult; outcome_date: string }

type Result = { ok: true; data: OutcomeRow | null } | { ok: false; error: string }

/** Records what happened to a customer. Passing null clears the outcome. */
export async function setOutcome(
  customerId: string,
  result: OutcomeResult | null,
): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  // Keep exactly one outcome per customer.
  const { error: deleteError } = await supabase
    .from('outcomes')
    .delete()
    .eq('customer_id', customerId)
  if (deleteError) return { ok: false, error: `Could not update: ${deleteError.message}` }

  let data: OutcomeRow | null = null
  if (result) {
    const { data: inserted, error } = await supabase
      .from('outcomes')
      .insert({ customer_id: customerId, result })
      .select('result, outcome_date')
      .single()
    if (error || !inserted) {
      return { ok: false, error: `Could not save: ${error?.message ?? 'unknown error'}` }
    }
    data = inserted as OutcomeRow
  }

  revalidatePath('/dashboard')
  revalidatePath('/reports')
  revalidatePath(`/customers/${customerId}`)
  return { ok: true, data }
}
