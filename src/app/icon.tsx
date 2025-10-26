import { ImageResponse } from 'next/og'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#1a2332"/>
        
        <path d="M16 2L6 6v7c0 6.2 4.3 12 10 13.5 5.7-1.5 10-7.3 10-13.5V6L16 2z" 
                stroke="#3b9dd8" 
                stroke-width="1.5" 
                fill="none"/>

        <rect x="14" y="13.5" width="4" height="4" rx="0.5" fill="#ff5e5e"/>

        <circle cx="16" cy="15" r="0.6" fill="#1a2332"/>
        <rect x="15.6" y="15" width="0.8" height="1.5" fill="#1a2332"/>
        
        <path d="M15 13.5v-1.5a1 1 0 0 1 2 0v1.5" 
                stroke="#ff5e5e" 
                stroke-width="1.2" 
                fill="none" 
                stroke-linecap="round"/>
        
        <path d="M11 13l-2 2 2 2" 
                stroke="#ff5e5e" 
                stroke-width="1.5" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
        
        <path d="M21 13l2 2-2 2" 
                stroke="#ff5e5e" 
                stroke-width="1.5" 
                fill="none" 
                stroke-linecap="round" 
                stroke-linejoin="round"/>
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
