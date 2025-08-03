/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@viport/types', '@viport/utils'],
  },
  transpilePackages: ['@viport/ui', '@viport/types', '@viport/utils'],
  images: {
    domains: ['localhost', 'api.viport.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig