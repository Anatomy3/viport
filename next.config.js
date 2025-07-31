/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configuration
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  
  // Output configuration for Docker deployment
  output: 'standalone',
  
  // Experimental features
  experimental: {
    // Enable app directory
    appDir: true,
    // Enable server components
    serverComponentsExternalPackages: ['@prisma/client'],
    // Optimize bundle size
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'framer-motion',
    ],
    // Enable modern features
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    // Optimize server components
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
    // Enable partial prerendering
    ppr: true,
  },

  // Image optimization - Enterprise grade
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_CDN_DOMAIN || 'cdn.viport.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    loader: 'default',
    unoptimized: false,
  },

  // Enterprise-grade security headers
  async headers() {
    const isDev = process.env.NODE_ENV === 'development'
    const cspHeader = `
      default-src 'self';
      script-src 'self' ${isDev ? "'unsafe-eval'" : ''} 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      img-src 'self' blob: data: https: http:;
      font-src 'self' https://fonts.gstatic.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim()

    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  // Rewrites for API proxy (if needed)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8080/api/:path*'
          : '/api/:path*',
      },
    ]
  },

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Webpack configuration - Enterprise optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
        enabled: process.env.ANALYZE === 'true',
      })
      config.plugins.push(new BundleAnalyzerPlugin())
    }

    // Production optimizations
    if (!dev) {
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Bundle vendor libraries separately
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Bundle common code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Bundle React libraries
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              priority: 30,
            },
            // Bundle UI libraries
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react)[\\/]/,
              priority: 25,
            },
          },
        },
      }

      // Tree shaking optimization
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // Minimize bundle size
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        // Use smaller alternatives
        'lodash': 'lodash-es',
      }
    }

    // Handle SVG imports with optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: true,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    })

    // Optimize watch options
    config.watchOptions = {
      ignored: [
        '**/node_modules',
        '**/.next',
        '**/out',
        '**/.turbo',
        '**/dist',
        '**/.git',
      ],
      poll: false,
      aggregateTimeout: 300,
    }

    // Add performance hints
    if (!dev) {
      config.performance = {
        hints: 'warning',
        maxEntrypointSize: 400000, // 400KB
        maxAssetSize: 300000, // 300KB
      }
    }

    return config
  },

  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors. Not recommended for production use.
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Not recommended for production use.
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib', 'src'],
  },

  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Logging
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // Dev indicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // Server runtime config
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: process.env.MY_SECRET,
    secondSecret: process.env.SECOND_SECRET,
  },

  // Public runtime config
  publicRuntimeConfig: {
    // Will be available on both server and client
    staticFolder: '/static',
  },
}

// Import required modules at the top
const path = require('path')

// Plugins configuration
const withPlugins = require('next-compose-plugins')

// Bundle analyzer plugin
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withPlugins([
  [withBundleAnalyzer],
], nextConfig)