import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/playwright-results.json' }],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Capture screenshot after each test failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for all tests
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },

  // Configure global setup and teardown
  globalSetup: require.resolve('./tests/e2e/global-setup'),
  globalTeardown: require.resolve('./tests/e2e/global-teardown'),

  // Configure projects for major browsers
  projects: [
    // Setup project - runs before all other projects
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Use prepared auth state
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Authenticated tests
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: /.*\.auth\.spec\.ts/,
    },

    // API testing
    {
      name: 'api',
      use: {
        baseURL: process.env.PLAYWRIGHT_API_URL || 'http://localhost:8080',
      },
      testMatch: /.*\.api\.spec\.ts/,
    },
  ],

  // Test timeout
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  // Run your local dev server before starting the tests
  webServer: process.env.CI ? undefined : [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'cd ../backend && go run cmd/api/main.go',
      url: 'http://localhost:8080/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],

  // Output directory for test artifacts
  outputDir: 'test-results/',
  
  // Maximum number of test failures for the whole test suite
  maxFailures: process.env.CI ? 10 : undefined,
})