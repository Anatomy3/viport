import Script from 'next/script'

interface StructuredDataProps {
  data: Record<string, any>
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_FRONTEND_URL}${item.url}`,
    })),
  }

  return <StructuredData data={breadcrumbData} />
}

interface WebsiteStructuredDataProps {
  searchUrl?: string
}

export function WebsiteStructuredData({ searchUrl }: WebsiteStructuredDataProps) {
  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Viport',
    alternateName: 'Viport - Enterprise Social Media Platform',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    description: 'Enterprise social media platform for creators and professionals',
    publisher: {
      '@type': 'Organization',
      name: 'Viport Inc.',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/logo.png`,
        width: 512,
        height: 512,
      },
    },
    ...(searchUrl && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${process.env.NEXT_PUBLIC_FRONTEND_URL}${searchUrl}?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }),
  }

  return <StructuredData data={websiteData} />
}

interface OrganizationStructuredDataProps {
  contacts?: {
    contactType: string
    telephone?: string
    email?: string
  }[]
}

export function OrganizationStructuredData({ contacts }: OrganizationStructuredDataProps) {
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Viport Inc.',
    alternateName: 'Viport',
    url: process.env.NEXT_PUBLIC_FRONTEND_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/images/logo.png`,
      width: 512,
      height: 512,
    },
    description: 'Enterprise social media platform for creators and professionals',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/viport',
      'https://linkedin.com/company/viport',
      'https://github.com/viport',
    ],
    ...(contacts && { contactPoint: contacts }),
  }

  return <StructuredData data={organizationData} />
}