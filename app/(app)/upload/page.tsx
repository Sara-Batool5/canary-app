import type { Metadata } from 'next'

import { PageHeader } from '@/components/app-shell/page-header'
import { UploadForm } from '@/components/upload/upload-form'
import { getScoringConfig } from '@/lib/customers'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = { title: 'Upload data' }

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <PageHeader
        title="Upload data"
        description="Import or refresh your customer data. Canary scores every account's health as it imports."
      />
      <UploadForm scoring={getScoringConfig(user)} />
    </>
  )
}
