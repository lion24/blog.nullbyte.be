import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

type InteractiveLinkProps = {
  href: string
  children: ReactNode
  className?: string
  baseColor?: string
  hoverColor?: string
  backgroundColor?: string
  hoverBackgroundColor?: string
  border?: string
  hoverBorder?: string
  target?: string
  rel?: string
}

/**
 * Server-rendered link with hover effects. Per-instance colors are passed in
 * as inline CSS custom properties; the actual `:hover` swap lives in CSS
 * (.interactive-link in globals.css). No React state, no client JS.
 */
export default function InteractiveLink({
  href,
  children,
  className = '',
  baseColor,
  hoverColor,
  backgroundColor,
  hoverBackgroundColor,
  border,
  hoverBorder,
  target,
  rel,
}: InteractiveLinkProps) {
  const style: CSSProperties = {}
  if (baseColor) (style as Record<string, string>)['--il-color'] = baseColor
  if (hoverColor) (style as Record<string, string>)['--il-color-hover'] = hoverColor
  if (backgroundColor) (style as Record<string, string>)['--il-bg'] = backgroundColor
  if (hoverBackgroundColor) (style as Record<string, string>)['--il-bg-hover'] = hoverBackgroundColor
  if (border) (style as Record<string, string>)['--il-border'] = border
  if (hoverBorder) (style as Record<string, string>)['--il-border-hover'] = hoverBorder

  return (
    <Link
      href={href}
      className={`interactive-link ${className}`.trim()}
      style={style}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  )
}
