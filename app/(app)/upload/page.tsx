import type { Metadata } from 'next'
import { Upload } from 'lucide-react'

import { PageHeader } from '@/components/app-shell/page-header'
import { PlaceholderCard } from '@/components/app-shell/placeholder-card'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Upload data' }

export default function UploadPage() {
  return (
    <>
      <PageHeader
        title="Upload data"
        description="Import usage, billing, and support data to score customer health."
      />
      <PlaceholderCard
        icon={Upload}
        title="Import a CSV"
        description="File uploads aren't connected yet — this is a placeholder."
      >
        <Button disabled>Choose file</Button>
      </PlaceholderCard>
    </>
  )
}
