// Global teardown for Jest tests
module.exports = async () => {
  // Cleanup after all tests
  console.log('🧹 Cleaning up test environment...')
  
  // Any global cleanup logic here
  // For example: stop test servers, cleanup test databases, etc.
  
  console.log('✅ Test environment cleaned up')
}