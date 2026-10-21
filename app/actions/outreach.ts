'use server'

import { revalidatePath } from 'next/cache'

import type { OutreachRow, OutreachStatus, Tone } from '@/lib/outreach'
import { daysSince } from '@/lib/scoring'
import { createClient } from '@/lib/supabase/server'

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

const TONE_RULES: Record<Tone, string> = {
  friendly: 'Warm and conversational. About 90 to 120 words.',
  formal: 'Professional and polite. About 100 to 130 words.',
  short: 'Very brief: three short sentences, about 40 to 60 words.',
}

const SYSTEM_PROMPT = `You write short outreach emails for a SaaS customer success team. The goal is to re-engage a customer who may be drifting away, in a helpful and human way.

Rules:
- Start with one line in the form "Subject: ..." then a blank line, then the email body.
- Greet the customer's company by name, for example "Hi Acme team,".
- Offer concrete help (a quick call, a walkthrough, or sorting out open issues). Do NOT promise discounts, credits, new features, or deadlines.
- Never mention health scores, risk, churn, or that their data was analysed. You may gently refer to an observation when it helps, such as "I noticed it has been a while since your team logged in".
- Do not invent facts about the customer's product usage.
- End with a clear, low-pressure next step and sign off with "[Your name]".
- Plain text only. No markdown, no bullet points.`

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export async function generateOutreach(
  customerId: string,
  tone: Tone,
): Promise<Result<OutreachRow>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      error:
        'AI drafting is not set up yet. Add GROQ_API_KEY in your Vercel environment variables and redeploy.',
    }
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('name, plan, last_login, risk_reasons')
    .eq('id', customerId)
    .maybeSingle()
  if (!customer) return { ok: false, error: 'Customer not found.' }

  const signals: string[] = customer.risk_reasons ?? []
  const idle = daysSince(customer.last_login)
  const facts = [
    `Company: ${customer.name}`,
    customer.plan ? `Plan: ${customer.plan}` : null,
    idle !== null ? `Days since last login: ${idle}` : null,
    signals.length > 0
      ? `Warning signs: ${signals.join('; ')}`
      : 'Warning signs: none in particular',
  ]
    .filter(Boolean)
    .join('\n')

  // gpt-oss models "think" before answering, so they need extra room for output.
  const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  const isReasoningModel = model.includes('gpt-oss')

  let message = ''
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_completion_tokens: isReasoningModel ? 2000 : 500,
        ...(isReasoningModel ? { reasoning_effort: 'low' } : {}),
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\nTone: ${TONE_RULES[tone]}` },
          { role: 'user', content: `${facts}\n\nWrite the email.` },
        ],
      }),
    })

    if (response.status === 429) {
      return {
        ok: false,
        error: 'The AI service is busy (rate limit). Please wait a minute and try again.',
      }
    }
    if (!response.ok) {
      return { ok: false, error: `The AI service returned an error (${response.status}).` }
    }
    const json = await response.json()
    message = String(json?.choices?.[0]?.message?.content ?? '').trim()
  } catch {
    return { ok: false, error: 'Could not reach the AI service. Please try again.' }
  }

  if (!message) return { ok: false, error: 'The AI returned an empty message. Please try again.' }

  const { data: latest } = await supabase
    .from('outreach')
    .select('id, status')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const query =
    latest && latest.status === 'draft'
      ? supabase.from('outreach').update({ message, tone }).eq('id', latest.id)
      : supabase.from('outreach').insert({ customer_id: customerId, message, tone, status: 'draft' })

  const { data, error } = await query.select().single()
  if (error || !data) {
    return { ok: false, error: `Could not save the draft: ${error?.message ?? 'unknown error'}` }
  }

  revalidatePath('/outreach')
  return { ok: true, data: data as OutreachRow }
}

export async function saveOutreach(id: string, message: string): Promise<Result<OutreachRow>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'Please log in again.' }
  const text = message.trim()
  if (!text) return { ok: false, error: 'The message cannot be empty.' }

  const { data, error } = await supabase
    .from('outreach')
    .update({ message: text })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return { ok: false, error: `Could not save: ${error?.message ?? 'unknown error'}` }

  revalidatePath('/outreach')
  return { ok: true, data: data as OutreachRow }
}

export async function setOutreachStatus(
  id: string,
  status: OutreachStatus,
): Promise<Result<OutreachRow>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'Please log in again.' }

  const { data, error } = await supabase
    .from('outreach')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error || !data) return { ok: false, error: `Could not update: ${error?.message ?? 'unknown error'}` }

  revalidatePath('/outreach')
  return { ok: true, data: data as OutreachRow }
}
