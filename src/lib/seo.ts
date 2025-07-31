import type { Metadata } from 'next'
import type { User, Post, Portfolio } from '@/types/api'

// Default SEO configuration
export const DEFAULT_SEO = {
  title: 'Viport - Enterprise Social Media & Portfolio Platform',
  description: 'Create stunning portfolios, share your work, and connect with professionals on Viport - the enterprise social media platform for creators and businesses.',
  keywords: [
    'portfolio',
    'social media',
    'creative professionals',
    'business networking',
    'enterprise platform',
    'digital marketplace',
    'creator economy',
  ],
  authors: [{ name: 'Viport Team' }],
  creator: 'Viport',
  publisher: 'Viport Inc.',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  metadataBase: new URL(process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://viport.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Viport',
    title: 'Viport - Enterprise Social Media & Portfolio Platform',
    description: 'Create stunning portfolios, share your work, and connect with professionals on Viport.',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Viport - Enterprise Social Media Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@viport',
    creator: '@viport',
    title: 'Viport - Enterprise Social Media & Portfolio Platform',
    description: 'Create stunning portfolios, share your work, and connect with professionals.',
    images: ['/images/twitter-card.jpg'],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    bing: process.env.BING_VERIFICATION,
  },
} as const

// Generate metadata for user profiles
export function generateUserMetadata(user: User): Metadata {
  const title = `${user.firstName} ${user.lastName} (@${user.username}) - Viport`
  const description = user.bio 
    ? `${user.bio.slice(0, 155)}...`
    : `View ${user.firstName} ${user.lastName}'s profile on Viport. ${user.followersCount} followers, ${user.postsCount} posts.`
  
  return {
    title,
    description,
    keywords: [
      user.username,
      user.firstName,
      user.lastName,
      'profile',
      'portfolio',
      'social media',
      ...DEFAULT_SEO.keywords,
    ],
    openGraph: {
      type: 'profile',
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
      title,
      description,
      images: [
        {
          url: user.avatar || '/images/default-avatar.jpg',
          width: 400,
          height: 400,
          alt: `${user.firstName} ${user.lastName}'s profile picture`,
        },
      ],
      url: `/users/${user.username}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [user.avatar || '/images/default-avatar.jpg'],
    },
    alternates: {
      canonical: `/users/${user.username}`,
    },
  }
}

// Generate metadata for posts
export function generatePostMetadata(post: Post): Metadata {
  const title = `Post by ${post.author.firstName} ${post.author.lastName} - Viport`
  const description = post.content.length > 155 
    ? `${post.content.slice(0, 155)}...`
    : post.content

  const images = post.images?.length > 0 
    ? post.images.map(img => ({
        url: img.url,
        width: 1200,
        height: 630,
        alt: img.alt || 'Post image',
      }))
    : [{ url: '/images/og-default.jpg', width: 1200, height: 630, alt: 'Viport Post' }]

  return {
    title,
    description,
    keywords: [
      ...post.tags,
      post.author.username,
      'post',
      'social media',
      ...DEFAULT_SEO.keywords,
    ],
    openGraph: {
      type: 'article',
      article: {
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [`${post.author.firstName} ${post.author.lastName}`],
        tags: post.tags,
      },
      title,
      description,
      images,
      url: `/posts/${post.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [images[0]?.url || '/images/twitter-card.jpg'],
    },
    alternates: {
      canonical: `/posts/${post.id}`,
    },
  }
}

// Generate metadata for portfolios
export function generatePortfolioMetadata(portfolio: Portfolio): Metadata {
  const title = `${portfolio.title} - ${portfolio.user.firstName} ${portfolio.user.lastName} Portfolio`
  const description = portfolio.description.length > 155
    ? `${portfolio.description.slice(0, 155)}...`
    : portfolio.description

  return {
    title,
    description,
    keywords: [
      'portfolio',
      portfolio.user.username,
      portfolio.user.firstName,
      portfolio.user.lastName,
      'creative work',
      'professional',
      ...DEFAULT_SEO.keywords,
    ],
    openGraph: {
      type: 'website',
      title,
      description,
      images: [
        {
          url: '/images/portfolio-og.jpg', // You might want to generate this dynamically
          width: 1200,
          height: 630,
          alt: `${portfolio.title} - Portfolio`,
        },
      ],
      url: `/portfolio/${portfolio.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/images/portfolio-twitter.jpg'],
    },
    alternates: {
      canonical: `/portfolio/${portfolio.slug}`,
    },
  }
}

// Generate JSON-LD structured data
export function generatePersonStructuredData(user: User) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${user.firstName} ${user.lastName}`,
    alternateName: user.username,
    description: user.bio,
    image: user.avatar,
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/users/${user.username}`,
    sameAs: [
      user.socialLinks?.twitter && `https://twitter.com/${user.socialLinks.twitter}`,
      user.socialLinks?.linkedin && `https://linkedin.com/in/${user.socialLinks.linkedin}`,
      user.socialLinks?.github && `https://github.com/${user.socialLinks.github}`,
      user.socialLinks?.instagram && `https://instagram.com/${user.socialLinks.instagram}`,
    ].filter(Boolean),
    jobTitle: 'Creative Professional',
    worksFor: {
      '@type': 'Organization',
      name: 'Viport',
    },
  }
}

export function generateArticleStructuredData(post: Post) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.content.slice(0, 110),
    description: post.content,
    image: post.images?.map(img => img.url) || [],
    author: {
      '@type': 'Person',
      name: `${post.author.firstName} ${post.author.lastName}`,
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/users/${post.author.username}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Viport',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/logo.png`,
      },
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_FRONTEND_URL}/posts/${post.id}`,
    },
    keywords: post.tags.join(', '),
    articleSection: 'Social Media',
    wordCount: post.content.split(' ').length,
  }
}

export function generateCreativeWorkStructuredData(portfolio: Portfolio) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: portfolio.title,
    description: portfolio.description,
    creator: {
      '@type': 'Person',
      name: `${portfolio.user.firstName} ${portfolio.user.lastName}`,
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/users/${portfolio.user.username}`,
    },
    dateCreated: portfolio.createdAt,
    dateModified: portfolio.updatedAt,
    url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/portfolio/${portfolio.slug}`,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Viport',
      url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    },
  }
}