import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'

// API test client configuration
export class ApiTestClient {
  private baseURL: string
  private authToken?: string

  constructor(baseURL = process.env.API_BASE_URL || 'http://localhost:8080') {
    this.baseURL = baseURL
  }

  // Authentication methods
  async authenticate(email: string, password: string): Promise<string> {
    const response = await this.post('/auth/login', { email, password })
    this.authToken = response.data.token
    return this.authToken
  }

  setAuthToken(token: string) {
    this.authToken = token
  }

  clearAuth() {
    this.authToken = undefined
  }

  // HTTP methods with automatic auth headers
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`
    }
    
    return headers
  }

  async get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios.get(`${this.baseURL}${url}`, {
      ...config,
      headers: { ...this.getHeaders(), ...config?.headers },
    })
  }

  async post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios.post(`${this.baseURL}${url}`, data, {
      ...config,
      headers: { ...this.getHeaders(), ...config?.headers },
    })
  }

  async put(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios.put(`${this.baseURL}${url}`, data, {
      ...config,
      headers: { ...this.getHeaders(), ...config?.headers },
    })
  }

  async patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios.patch(`${this.baseURL}${url}`, data, {
      ...config,
      headers: { ...this.getHeaders(), ...config?.headers },
    })
  }

  async delete(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
    return axios.delete(`${this.baseURL}${url}`, {
      ...config,
      headers: { ...this.getHeaders(), ...config?.headers },
    })
  }
}

// Test data generators
export const generateTestUser = (overrides = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  username: `testuser${Date.now()}`,
  ...overrides,
})

export const generateTestPost = (overrides = {}) => ({
  content: 'This is a test post content',
  tags: ['test', 'api'],
  images: [],
  ...overrides,
})

export const generateTestPortfolio = (overrides = {}) => ({
  title: 'Test Portfolio',
  description: 'This is a test portfolio description',
  slug: `test-portfolio-${Date.now()}`,
  ...overrides,
})

export const generateTestProduct = (overrides = {}) => ({
  title: 'Test Product',
  description: 'This is a test product description',
  price: 99.99,
  currency: 'USD',
  category: 'digital',
  images: [],
  ...overrides,
})

// API response assertions
export const assertApiResponse = (response: AxiosResponse, expectedStatus = 200) => {
  expect(response.status).toBe(expectedStatus)
  expect(response.data).toBeDefined()
  
  if (response.data.success !== undefined) {
    expect(response.data.success).toBe(true)
  }
}

export const assertApiError = (response: AxiosResponse, expectedStatus: number) => {
  expect(response.status).toBe(expectedStatus)
  
  if (response.data.success !== undefined) {
    expect(response.data.success).toBe(false)
  }
  
  expect(response.data.error || response.data.message).toBeDefined()
}

export const assertPaginatedResponse = (response: AxiosResponse) => {
  assertApiResponse(response)
  
  const { data } = response.data
  expect(data).toHaveProperty('items')
  expect(data).toHaveProperty('pagination')
  expect(data.pagination).toHaveProperty('page')
  expect(data.pagination).toHaveProperty('limit')
  expect(data.pagination).toHaveProperty('total')
  expect(data.pagination).toHaveProperty('totalPages')
}

// Database cleanup utilities
export const cleanupTestData = async (client: ApiTestClient, resources: string[]) => {
  for (const resource of resources) {
    try {
      // This would depend on your API having cleanup endpoints
      await client.delete(`/test/cleanup/${resource}`)
    } catch (error) {
      console.warn(`Failed to cleanup ${resource}:`, error)
    }
  }
}

// Performance testing utilities
export const measureApiPerformance = async (
  apiCall: () => Promise<AxiosResponse>,
  expectedMaxTime = 1000
) => {
  const startTime = Date.now()
  const response = await apiCall()
  const endTime = Date.now()
  
  const duration = endTime - startTime
  
  expect(duration).toBeLessThan(expectedMaxTime)
  
  return {
    response,
    duration,
  }
}

// Load testing utilities
export const performLoadTest = async (
  apiCall: () => Promise<AxiosResponse>,
  options: {
    concurrency: number
    iterations: number
    maxResponseTime?: number
  }
) => {
  const { concurrency, iterations, maxResponseTime = 2000 } = options
  const results: Array<{ duration: number; success: boolean; error?: string }> = []

  const runBatch = async (): Promise<void> => {
    const promises = Array.from({ length: concurrency }, async () => {
      const startTime = Date.now()
      try {
        await apiCall()
        const duration = Date.now() - startTime
        results.push({ duration, success: true })
      } catch (error) {
        const duration = Date.now() - startTime
        results.push({ 
          duration, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    })
    
    await Promise.all(promises)
  }

  // Run iterations
  for (let i = 0; i < iterations; i++) {
    await runBatch()
  }

  // Analyze results
  const successfulRequests = results.filter(r => r.success)
  const failedRequests = results.filter(r => !r.success)
  const durations = successfulRequests.map(r => r.duration)
  
  const avgResponseTime = durations.reduce((a, b) => a + b, 0) / durations.length
  const maxResponseTime = Math.max(...durations)
  const minResponseTime = Math.min(...durations)
  const successRate = (successfulRequests.length / results.length) * 100

  return {
    totalRequests: results.length,
    successfulRequests: successfulRequests.length,
    failedRequests: failedRequests.length,
    successRate,
    avgResponseTime,
    maxResponseTime,
    minResponseTime,
    failures: failedRequests,
  }
}

// Mock server utilities for testing
export const createMockApiResponse = (data: any, success = true, status = 200) => ({
  data: {
    success,
    data,
    message: success ? 'Success' : 'Error',
    ...(success ? {} : { error: 'Test error' }),
  },
  status,
  statusText: success ? 'OK' : 'Error',
  headers: {},
  config: {} as AxiosRequestConfig,
})

// Contract testing utilities
export const validateApiContract = (response: AxiosResponse, schema: any) => {
  // This would integrate with a schema validation library like Joi or Yup
  // For now, basic structure validation
  expect(response.data).toMatchObject(schema)
}

// Setup and teardown helpers
export const setupApiTests = async () => {
  // Global test setup
  const client = new ApiTestClient()
  
  // Wait for API to be ready
  let retries = 10
  while (retries > 0) {
    try {
      await client.get('/health')
      break
    } catch (error) {
      retries--
      if (retries === 0) throw new Error('API not available for testing')
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
  
  return client
}

export const teardownApiTests = async (client: ApiTestClient) => {
  // Clean up any test data
  await cleanupTestData(client, ['users', 'posts', 'portfolios', 'products'])
}