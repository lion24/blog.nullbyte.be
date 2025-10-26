import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getFullUrl } from '@/lib/url'

type Props = {
  params: Promise<{ slug: string }>
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
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const postUrl = getFullUrl(`/posts/${slug}`)

  return {
    title: post.title,
    description: post.excerpt || post.title,
    keywords: post.tags?.map((tag) => tag.name).join(', '),
    authors: [{ name: post.author?.name || 'Anonymous' }],
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt || post.title,
      url: postUrl,
      publishedTime: post.createdAt.toISOString(),
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
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      ...(post.featuredImage && {
        images: [post.featuredImage],
      }),
    },
  }
}

export default async function PostLayout({ children, params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return children
  }

  const postUrl = getFullUrl(`/posts/${slug}`)

  // Build JSON-LD structured data for Article
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Anonymous',
    },
    ...(post.featuredImage && {
      image: [post.featuredImage],
    }),
    ...(post.excerpt && {
      description: post.excerpt,
    }),
    url: postUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NullByte',
      logo: {
        '@type': 'ImageObject',
        url: getFullUrl('/logo.png'), // You can update this to your actual logo
      },
    },
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
