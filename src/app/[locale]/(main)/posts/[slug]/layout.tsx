import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getFullUrl } from '@/lib/url'

type Props = {
  params: Promise<{ slug: string; locale: string }>
  children: React.ReactNode
}

async function getPost(slug: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        tags: {
          select: { name: true },
        },
      },
    })

    if (!post) {
      return null
    }

    return post
  } catch (error) {
    console.error('Error fetching post for metadata:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const postUrl = getFullUrl(`/${locale}/posts/${slug}`)
  const baseUrl = getFullUrl('')

  return {
    title: post.title,
    description: post.excerpt || post.title,
    keywords: post.tags?.map((tag) => tag.name).join(', '),
    authors: [{ name: post.author?.name || 'Anonymous' }],
    alternates: {
      canonical: postUrl,
      languages: {
        'en': `${baseUrl}/en/posts/${slug}`,
        'fr': `${baseUrl}/fr/posts/${slug}`,
      },
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.title,
      url: postUrl,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author?.name || 'Anonymous'],
      tags: post.tags?.map((tag) => tag.name),
      ...(post.featuredImage && {
        images: [
          {
            url: post.featuredImage,
            alt: post.title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary',
      title: post.title,
      description: post.excerpt || post.title,
      ...(post.featuredImage && {
        images: [post.featuredImage],
      }),
    },
  }
}

export default async function PostLayout({ children, params }: Props) {
  const { slug, locale } = await params
  const post = await getPost(slug)

  if (!post) {
    return children
  }

  const postUrl = getFullUrl(`/${locale}/posts/${slug}`)

  // Build JSON-LD structured data for BlogPosting (recommended for blog posts)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    ...(post.excerpt && {
      description: post.excerpt,
    }),
    ...(post.featuredImage && {
      image: {
        '@type': 'ImageObject',
        url: post.featuredImage,
      },
    }),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Anonymous',
      ...(post.author?.email && {
        email: post.author.email,
      }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'NullByte',
      logo: {
        '@type': 'ImageObject',
        url: getFullUrl('/logo.png'),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
    ...(post.tags && post.tags.length > 0 && {
      keywords: post.tags.map((tag) => tag.name).join(', '),
    }),
    inLanguage: locale,
    isAccessibleForFree: true,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  )
}
