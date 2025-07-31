import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'

// Mock providers for testing
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence errors in tests
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Mock data generators
export const mockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  username: 'testuser',
  avatar: '/test-avatar.jpg',
  verified: true,
  bio: 'Test user bio',
  followersCount: 100,
  followingCount: 50,
  postsCount: 25,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const mockPost = (overrides = {}) => ({
  id: 'test-post-id',
  content: 'This is a test post content',
  author: mockUser(),
  images: [],
  tags: ['test', 'mock'],
  likesCount: 10,
  commentsCount: 5,
  sharesCount: 2,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const mockPortfolio = (overrides = {}) => ({
  id: 'test-portfolio-id',
  title: 'Test Portfolio',
  description: 'This is a test portfolio description',
  slug: 'test-portfolio',
  user: mockUser(),
  viewsCount: 100,
  likesCount: 25,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const mockProduct = (overrides = {}) => ({
  id: 'test-product-id',
  title: 'Test Product',
  description: 'This is a test product description',
  price: 99.99,
  currency: 'USD',
  images: [],
  seller: mockUser(),
  category: 'digital',
  status: 'active',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
})

// API mock helpers
export const mockApiResponse = (data: any, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
  ...(success ? {} : { error: 'Test error' }),
})

export const mockApiError = (message = 'Test error', status = 500) => ({
  success: false,
  error: message,
  status,
  data: null,
})

// Test utilities
export const waitFor = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms))

export const createMockRouter = (overrides = {}) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn().mockResolvedValue(true),
  replace: jest.fn().mockResolvedValue(true),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isReady: true,
  ...overrides,
})

// Form testing utilities
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react')
  
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      fireEvent.change(input, { target: { value } })
    }
  })
}

export const submitForm = async (form: HTMLFormElement) => {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent.submit(form)
}

// Custom matchers (if needed)
export const customMatchers = {
  toHaveFormError: (received: HTMLElement, fieldName: string) => {
    const errorElement = received.querySelector(`[data-testid="${fieldName}-error"]`)
    const pass = errorElement !== null
    
    return {
      message: () =>
        pass
          ? `Expected form not to have error for field "${fieldName}"`
          : `Expected form to have error for field "${fieldName}"`,
      pass,
    }
  },
}

// Add custom matchers to Jest
if (typeof expect !== 'undefined') {
  expect.extend(customMatchers)
}