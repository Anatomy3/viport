import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up Playwright tests...')
  
  // Get the base URL from config
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'
  
  // Launch browser for authentication setup
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...')
    await page.goto(baseURL)
    await page.waitForLoadState('networkidle')

    // Setup authentication if needed
    // This is where you would login a test user and save the auth state
    console.log('🔐 Setting up authentication...')
    
    // Example: Login flow (customize based on your auth system)
    /*
    await page.goto(`${baseURL}/login`)
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'testpassword')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('**/dashboard')
    
    // Save signed-in state to 'tests/e2e/.auth/user.json'
    await page.context().storageState({ path: 'tests/e2e/.auth/user.json' })
    */

    console.log('✅ Playwright setup complete')
  } catch (error) {
    console.error('❌ Setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup