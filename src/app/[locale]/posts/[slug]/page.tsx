import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ContentRenderer from '@/components/ContentRenderer'
import SocialShare from '@/components/SocialShare'
import InteractiveLink from '@/components/InteractiveLink'
import { ViewCounter } from '@/components/ViewCounter'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { calculateReadingTime } from '@/lib/reading-time'
import { getFullUrl } from '@/lib/url'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

type Post = {
  id: string
  title: string
  content: string
  excerpt: string | null
  featuredImage: string | null
  published: boolean
  views: number
  readingTime: number
  createdAt: string
  updatedAt: string
  author: {
    name: string | null
  }
  tags: Array<{ id: string; name: string; slug: string }>
  categories: Array<{ id: string; name: string }>
}

async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: true,
      tags: true,
      categories: true,
    },
  })

  if (!post || !post.published) {
    return null
  }

  return {
    ...post,
    views: post.views,
    readingTime: calculateReadingTime(post.content),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPostBySlug(slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const fullUrl = getFullUrl(`/${locale}/posts/${slug}`)
  const baseUrl = getFullUrl('')
  
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: {
      canonical: fullUrl,
      languages: {
        'en': `${baseUrl}/en/posts/${slug}`,
        'fr': `${baseUrl}/fr/posts/${slug}`,
      },
    },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: 'article',
      url: fullUrl,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: post.author.name ? [post.author.name] : undefined,
      tags: post.tags.map(tag => tag.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || undefined,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug, locale } = await params
  const t = await getTranslations({ locale })
  const tSocial = await getTranslations({ locale, namespace: 'social' })
  
  // Fetch post directly from database
  const post = await getPostBySlug(slug)
  
  if (!post) {
    notFound()
  }

  // Get full URL for sharing
  const postUrl = getFullUrl(`/${locale}/posts/${slug}`)

  const socialTranslations = {
    share: tSocial('share'),
    shareOnFacebook: tSocial('shareOnFacebook'),
    shareOnX: tSocial('shareOnX'),
    shareOnReddit: tSocial('shareOnReddit'),
    copyLink: tSocial('copyLink'),
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          <Link href={`/${locale}`} className="hover:text-primary transition-colors">{t('breadcrumb.home')}</Link>
          <span>→</span>
          <Link href={`/${locale}/posts`} className="hover:text-primary transition-colors">{t('breadcrumb.posts')}</Link>
          <span>→</span>
          <span style={{ color: 'var(--text-primary)' }}>{post.title}</span>
        </div>

        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>{post.title}</h1>

        <div className="flex items-center justify-between flex-wrap gap-4 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center space-x-4">
            <span>{t('posts.byAuthor', { author: post.author.name || t('admin.anonymous') })}</span>
            <span>•</span>
            <time>{new Date(post.createdAt).toLocaleDateString()}</time>
            <span>•</span>
            <span>{t('common.readingTime', { minutes: post.readingTime })}</span>
            <span>•</span>
            <ViewCounter postId={post.id} initialViews={post.views} />
          </div>

          <div className="flex items-center space-x-2">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--text-inverse)',
                  opacity: 0.9
                }}
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>

        <div className="pb-6 mb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <SocialShare url={postUrl} title={post.title} translations={socialTranslations} />
        </div>
      </header>

      {post.featuredImage && (
        <div className="mb-8 -mx-4 md:mx-0">
          <div className="relative w-full h-[400px] md:h-[500px] md:rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {post.excerpt && (
        <div className="text-xl mb-8 italic" style={{ color: 'var(--text-secondary)' }}>
          {post.excerpt}
        </div>
      )}

      <div className="mb-8">
        <ContentRenderer content={post.content} />
      </div>

      <footer className="pt-8" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex items-center flex-wrap gap-2 mb-8">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('posts.tagsLabel')}</span>
          {post.tags.map((tag) => (
            <InteractiveLink
              key={tag.id}
              href={`/${locale}/tags/${tag.slug}`}
              className="text-sm transition-colors"
              baseColor="var(--text-tertiary)"
              hoverColor="var(--text-secondary)"
            >
              #{tag.name}
            </InteractiveLink>
          ))}
        </div>

        <InteractiveLink
          href={`/${locale}/posts`}
          className="inline-flex items-center transition-colors"
          baseColor="var(--primary)"
          hoverColor="var(--primary-hover)"
        >
          {t('common.backToAllPosts')}
        </InteractiveLink>
      </footer>
    </article>
  )
}
