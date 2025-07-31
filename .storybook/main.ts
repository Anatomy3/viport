import type { StorybookConfig } from '@storybook/nextjs'
import path from 'path'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    '@storybook/addon-backgrounds',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-actions',
    '@storybook/addon-measure',
    '@storybook/addon-outline',
  ],
  
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  
  docs: {
    autodocs: 'tag',
  },
  
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  // Webpack configuration
  webpackFinal: async (config) => {
    // Handle absolute imports
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../src'),
        '@/components': path.resolve(__dirname, '../src/components'),
        '@/lib': path.resolve(__dirname, '../src/lib'),
        '@/hooks': path.resolve(__dirname, '../src/hooks'),
        '@/utils': path.resolve(__dirname, '../src/utils'),
        '@/types': path.resolve(__dirname, '../src/types'),
        '@/styles': path.resolve(__dirname, '../src/styles'),
      }
    }

    // Handle CSS modules
    const cssRule = config.module?.rules?.find((rule) => {
      if (typeof rule !== 'object' || !rule) return false
      if ('test' in rule && rule.test instanceof RegExp) {
        return rule.test.test('test.css')
      }
      return false
    })

    if (cssRule && typeof cssRule === 'object' && 'use' in cssRule && Array.isArray(cssRule.use)) {
      cssRule.use = cssRule.use.map((loader) => {
        if (typeof loader === 'object' && loader && 'loader' in loader && loader.loader?.includes('css-loader')) {
          return {
            ...loader,
            options: {
              ...loader.options,
              modules: {
                auto: true,
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          }
        }
        return loader
      })
    }

    return config
  },

  // Static directories
  staticDirs: ['../public'],

  // Environment variables
  env: (config) => ({
    ...config,
    STORYBOOK: 'true',
  }),

  // Features
  features: {
    buildStoriesJson: true,
  },

  // Core configuration
  core: {
    disableTelemetry: true,
  },
}

export default config