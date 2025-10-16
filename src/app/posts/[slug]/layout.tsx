import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

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
          select: { name: true },
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

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/posts/${slug}`

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
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
    },
  }
}

export default function PostLayout({ children }: Props) {
  return children
}
