import { FullConfig } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up Playwright tests...')
  
  try {
    // Clean up auth files
    const authDir = path.join(__dirname, '.auth')
    if (fs.existsSync(authDir)) {
      fs.rmSync(authDir, { recursive: true, force: true })
      console.log('🗑️  Removed auth files')
    }

    // Clean up temporary test files
    const tempDir = path.join(__dirname, 'temp')
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
      console.log('🗑️  Removed temporary files')
    }

    // Any other cleanup logic
    console.log('✅ Playwright cleanup complete')
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
    // Don't throw error to avoid failing the test suite
  }
}

export default globalTeardown