export type Tone = 'friendly' | 'formal' | 'short'
export type OutreachStatus = 'draft' | 'approved' | 'sent'

export type OutreachRow = {
  id: string
  customer_id: string
  message: string
  tone: Tone
  status: OutreachStatus
  created_at: string
}

export const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'short', label: 'Short' },
]

export function splitMessage(message: string) {
  const match = message.match(/^\s*subject:\s*(.+)\r?\n+([\s\S]*)$/i)
  if (match) return { subject: match[1].trim(), body: match[2].trim() }
  return { subject: '', body: message.trim() }
}
