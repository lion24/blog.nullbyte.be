import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { TagSphere } from '@/components/TagSphere'
import { Breadcrumb } from '@/components/Breadcrumb'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ locale: string }>
}

type Tag = {
  id: string
  name: string
  slug: string
  count: number
}

async function getAllTags(): Promise<Tag[]> {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Filter out tags with no posts
  return tags
    .filter(tag => tag._count.posts > 0)
    .map(tag => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
      count: tag._count.posts
    }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'posts' })
  
  return {
    title: t('allTags'),
    description: 'Explore all tags and topics covered in our blog posts.',
  }
}

export default async function TagsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale })
  const tBreadcrumb = await getTranslations({ locale, namespace: 'breadcrumb' })
  const tags = await getAllTags()

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        locale={locale}
        items={[
          { label: tBreadcrumb('tags') }
        ]}
      />

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {t('posts.allTags')}
        </h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          {t('posts.foundCount', { count: tags.length })} • {t('posts.exploreTags')}
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-12 rounded-lg" style={{
          backgroundColor: 'var(--background-secondary)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)'
        }}>
          <p style={{ color: 'var(--text-tertiary)' }}>{t('posts.noTags')}</p>
        </div>
      ) : (
        <>
          {/* 3D Tag Sphere */}
          <div className="mb-12">
            <TagSphere tags={tags} locale={locale} radius={250} />
          </div>

          {/* Tag List (fallback/additional view) */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
              {t('posts.allTagsList')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <a
                  key={tag.id}
                  href={`/${locale}/tags/${tag.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--background-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span className="font-medium">#{tag.name}</span>
                  <span 
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--text-inverse)',
                      opacity: 0.9
                    }}
                  >
                    {tag.count}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
