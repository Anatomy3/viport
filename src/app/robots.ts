import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://viport.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/users/*',
          '/posts/*',
          '/portfolio/*',
          '/about',
          '/pricing',
          '/contact',
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/dashboard/*',
          '/settings/*',
          '/login',
          '/register',
          '/reset-password',
          '/verify-email',
          '/*.json$',
          '/private/*',
          '/temp/*',
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/users/*',
          '/posts/*',
          '/portfolio/*',
          '/about',
          '/pricing',
          '/contact',
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/dashboard/*',
          '/settings/*',
          '/login',
          '/register',
          '/private/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/users/*',
          '/posts/*',
          '/portfolio/*',
        ],
        disallow: [
          '/api/*',
          '/admin/*',
          '/dashboard/*',
          '/settings/*',
          '/private/*',
        ],
        crawlDelay: 2,
      },
      // Block aggressive crawlers
      {
        userAgent: [
          'AhrefsBot',
          'SemrushBot',
          'MJ12bot',
          'DotBot',
          'AspiegelBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}