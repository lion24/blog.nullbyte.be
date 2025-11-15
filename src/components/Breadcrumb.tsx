import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type BreadcrumbProps = {
  locale: string
  items: BreadcrumbItem[]
}

/**
 * Generic Breadcrumb component for navigation hierarchy.
 * 
 * Displays a breadcrumb trail with Home as the first item, followed by custom items.
 * The last item is always rendered as plain text (current page).
 * 
 * @example
 * // For a post page:
 * <Breadcrumb 
 *   locale="en"
 *   items={[
 *     { label: 'Posts', href: '/posts' },
 *     { label: 'My Post Title' }
 *   ]}
 * />
 * 
 * @example
 * // For a category page:
 * <Breadcrumb 
 *   locale="en"
 *   items={[
 *     { label: 'Posts', href: '/posts' },
 *     { label: 'Technology' }
 *   ]}
 * />
 */
export async function Breadcrumb({ locale, items }: BreadcrumbProps) {
  const t = await getTranslations({ locale, namespace: 'breadcrumb' })
  
  // Always start with Home
  const allItems: BreadcrumbItem[] = [
    { label: t('home'), href: `/${locale}` },
    ...items
  ]

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
      {allItems.map((item, index) => {
        const isLast = index === allItems.length - 1
        
        return (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden="true">→</span>}
            
            {isLast ? (
              // Current page - no link
              <span 
                aria-current="page"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.label}
              </span>
            ) : (
              // Linked breadcrumb item
              <Link 
                href={item.href!} 
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
