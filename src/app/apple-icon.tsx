import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="180" height="180" rx="40" fill="#1a2332"/>

        <path d="M90 20L40 35v40c0 35 24 67 50 75 32-8 50-40 50-75V35L90 20z"
              stroke="#3b9dd8"
              strokeWidth="8"
              fill="none"/>

        <rect x="80" y="80" width="20" height="20" rx="2" fill="#ff5e5e"/>

        <circle cx="90" cy="87" r="3" fill="#1a2332"/>
        <rect x="88" y="87" width="4" height="8" fill="#1a2332"/>

        <path d="M84 80v-8a6 6 0 0 1 12 0v8"
              stroke="#ff5e5e"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"/>

        <path d="M60 75l-10 10 10 10"
              stroke="#ff5e5e"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"/>

        <path d="M120 75l10 10-10 10"
              stroke="#ff5e5e"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"/>
      </svg>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  )
}
