'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Tag = {
  id: string
  name: string
  slug: string
  count: number
}

type TagSphereProps = {
  tags: Tag[]
  locale: string
  radius?: number
}

/**
 * Interactive 3D Tag Sphere Component
 * 
 * Renders tags in a 3D sphere that rotates automatically and responds to mouse movement.
 * Tags are clickable and navigate to their respective pages.
 * 
 * Based on: https://codesandbox.io/p/sandbox/tag-sphere-react-dkqs32
 * 
 * @param tags - Array of tags with id, name, slug, and count
 * @param locale - Current locale for navigation
 * @param radius - Sphere radius in pixels (default: 200)
 */
export function TagSphere({ tags, locale, radius = 200 }: TagSphereProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tagsPosition, setTagsPosition] = useState<Array<{ x: number; y: number; z: number; scale: number }>>([])
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const router = useRouter()

  // Initialize tags positions on a sphere
  useEffect(() => {
    const positions = tags.map((_, index) => {
      const phi = Math.acos(-1 + (2 * index) / tags.length)
      const theta = Math.sqrt(tags.length * Math.PI) * phi
      
      return {
        x: radius * Math.cos(theta) * Math.sin(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(phi),
        scale: 1
      }
    })
    
    setTagsPosition(positions)
  }, [tags, radius])

  // Auto-rotation and mouse interaction
  useEffect(() => {
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0
    const container = containerRef.current

    const handleMouseMove = (e: MouseEvent) => {
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      mouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      mouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    }

    const animate = () => {
      // Smooth rotation with auto-rotation and mouse influence
      targetX += 0.002 // Auto-rotation speed
      targetX += (mouseX * 0.1 - rotation.x) * 0.05
      targetY += (mouseY * 0.1 - rotation.y) * 0.05

      setRotation({ x: targetX, y: targetY })
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
    }

    animate()

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [rotation])

  // Rotate tags based on rotation state
  const rotatedPositions = tagsPosition.map(pos => {
    // Rotate around Y axis
    const cosY = Math.cos(rotation.x)
    const sinY = Math.sin(rotation.x)
    const x1 = pos.x * cosY - pos.z * sinY
    const z1 = pos.z * cosY + pos.x * sinY

    // Rotate around X axis
    const cosX = Math.cos(rotation.y)
    const sinX = Math.sin(rotation.y)
    const y1 = pos.y * cosX - z1 * sinX
    const z2 = z1 * cosX + pos.y * sinX

    // Calculate scale based on z position (perspective)
    const scale = (radius + z2) / (2 * radius)

    return {
      x: x1,
      y: y1,
      z: z2,
      scale: scale
    }
  })

  const handleTagClick = (slug: string) => {
    router.push(`/${locale}/tags/${slug}`)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{
        height: `${radius * 2 + 100}px`,
        perspective: '1000px'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {tags.map((tag, index) => {
          const pos = rotatedPositions[index]
          if (!pos) return null

          const fontSize = 12 + (tag.count / Math.max(...tags.map(t => t.count))) * 12
          const opacity = 0.3 + pos.scale * 0.7

          return (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.slug)}
              className="absolute transition-all duration-200 hover:scale-110 cursor-pointer"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate3d(${pos.x}px, ${pos.y}px, 0)`,
                fontSize: `${fontSize * pos.scale}px`,
                opacity: opacity,
                zIndex: Math.round(pos.scale * 100),
                color: 'var(--primary)',
                fontWeight: 500,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.25rem',
                border: 'none',
                background: 'none',
                whiteSpace: 'nowrap'
              }}
              aria-label={`View posts tagged with ${tag.name} (${tag.count} posts)`}
            >
              #{tag.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
