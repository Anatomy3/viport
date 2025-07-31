const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable Server Components
    serverComponentsExternalPackages: ['@viport/ui', '@viport/types'],
    // Optimize package imports
    optimizePackageImports: ['@viport/ui', 'lucide-react'],
  },

  // TypeScript and ESLint
  typescript: {
    // Enable type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint during build
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // Image optimization
  images: {
    domains: [
      'images.unsplash.com',
      'www.google.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/beranda',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/beranda',
        permanent: true,
      },
    ];
  },

  // Rewrites for API proxy (optional, if you need to proxy to Go backend)
  async rewrites() {
    return [
      {
        source: '/api/go/:path*',
        destination: `${process.env.GO_BACKEND_URL}/api/:path*`,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        default: false,
        vendors: false,
        vendor: {
          name: 'vendor',
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
        },
      },
    };

    return config;
  },

  // Output configuration
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = withBundleAnalyzer(nextConfig);