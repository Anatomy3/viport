import type { Preview } from '@storybook/react'
import { themes } from '@storybook/theming'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: themes.light,
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0f0f0f' },
        { name: 'gray', value: '#f5f5f5' },
      ],
    },
    viewport: {
      viewports: {
        mobile1: {
          name: 'Mobile (Small)',
          styles: { width: '375px', height: '667px' },
        },
        mobile2: {
          name: 'Mobile (Large)',
          styles: { width: '414px', height: '896px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1024px', height: '768px' },
        },
        largeDesktop: {
          name: 'Large Desktop',
          styles: { width: '1440px', height: '900px' },
        },
      },
    },
    layout: 'centered',
  },

  // Global decorators
  decorators: [
    (Story) => (
      <div className="font-sans antialiased">
        <Story />
      </div>
    ),
  ],

  // Global arg types
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },

  // Tags
  tags: ['autodocs'],
}

export default preview