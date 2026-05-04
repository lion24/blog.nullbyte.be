'use client'

import dynamic from 'next/dynamic'
import type { Value } from 'platejs'

// Lazy-load the Plate editor only when content is actually Plate JSON.
// This keeps the ~280 KB compressed Plate chunk out of the post-page bundle
// for the common markdown/HTML cases.
const PlatePreview = dynamic(
  () => import('./PlatePreview').then((m) => ({ default: m.PlatePreview })),
  { ssr: false }
)

export default function PlatePreviewClient(props: {
  value: Value
  className?: string
}) {
  return <PlatePreview {...props} />
}
