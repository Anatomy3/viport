// Global setup for Jest tests
module.exports = async () => {
  // Set timezone for consistent date testing
  process.env.TZ = 'UTC'
  
  // Setup test database if needed
  console.log('🧪 Setting up test environment...')
  
  // Any global setup logic here
  // For example: start test servers, setup test databases, etc.
  
  console.log('✅ Test environment ready')
}