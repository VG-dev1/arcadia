import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/insights',
        '/focus',
        '/settings',
        '/auth',
      ],
    },
    sitemap: 'https://app-arcadia.vercel.app/sitemap.xml',
  }
}
