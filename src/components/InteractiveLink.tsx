'use client'

import Link from 'next/link'
import { useState, ReactNode } from 'react'

type InteractiveLinkProps = {
  href: string
  children: ReactNode
  className?: string
  baseColor: string
  hoverColor: string
  backgroundColor?: string
  hoverBackgroundColor?: string
  border?: string
  hoverBorder?: string
  target?: string
  rel?: string
}

/**
 * Client-side interactive link component with hover effects
 * Use this in Server Components when you need hover states
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

  return (
    <Link
      href={href}
      className={className}
      style={{
        color: isHovered ? hoverColor : baseColor,
        backgroundColor: isHovered ? hoverBackgroundColor : backgroundColor,
        border: isHovered ? hoverBorder : border,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      target={target}
      rel={rel}
    >
      {children}
    </Link>
  )
}
