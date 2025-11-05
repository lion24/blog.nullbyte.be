'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'

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
 * InteractiveLink - A Client Component wrapper for Next.js Link with hover effects
 * 
 * This component allows Server Components to use interactive links with hover states
 * without needing to pass event handlers (which would cause React errors).
 * 
 * Usage:
 * <InteractiveLink 
 *   href="/some-path"
 *   baseColor="var(--text-tertiary)"
 *   hoverColor="var(--text-secondary)"
 *   target="_blank"
 *   rel="noopener noreferrer"
 * >
 *   Link Text
 * </InteractiveLink>
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
  const [isHovered, setIsHovered] = useState(false)

  const style: React.CSSProperties = {
    transition: 'all 0.2s ease',
  }

  if (baseColor || hoverColor) {
    style.color = isHovered ? hoverColor : baseColor
  }

  if (backgroundColor || hoverBackgroundColor) {
    style.backgroundColor = isHovered ? hoverBackgroundColor : backgroundColor
  }

  if (border || hoverBorder) {
    style.border = isHovered ? hoverBorder : border
  }

  return (
    <Link
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Link>
  )
}
