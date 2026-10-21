import type { Metadata } from 'next'

import { PageHeader } from '@/components/app-shell/page-header'
import { UploadForm } from '@/components/upload/upload-form'

export const metadata: Metadata = { title: 'Upload data' }

export default function UploadPage() {
  return (
    <>
      <PageHeader
        title="Upload data"
        description="Import your customer data. Canary scores every account's health as it imports."
      />
      <UploadForm />
    </>
  )
}
