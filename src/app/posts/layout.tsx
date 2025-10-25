import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Posts',
  description: 'Browse all blog posts about web development, programming, and software engineering.',
  openGraph: {
    title: 'All Posts',
    description: 'Browse all blog posts about web development, programming, and software engineering.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Posts',
    description: 'Browse all blog posts about web development, programming, and software engineering.',
  },
}

export default function PostsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
