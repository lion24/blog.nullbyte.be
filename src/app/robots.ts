import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Construct base URL
  const vercelUrl = process.env.VERCEL_URL
  const baseUrl = vercelUrl
    ? `https://${vercelUrl}`
    : (process.env.NEXTAUTH_URL || 'http://localhost:3000')

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
