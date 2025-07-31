import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { 
  ApiTestClient, 
  generateTestUser, 
  assertApiResponse, 
  assertApiError,
  setupApiTests,
  teardownApiTests 
} from './api-test-utils'

describe('Users API', () => {
  let client: ApiTestClient
  let testUser: any
  let authToken: string

  beforeAll(async () => {
    client = await setupApiTests()
  })

  afterAll(async () => {
    await teardownApiTests(client)
  })

  beforeEach(() => {
    testUser = generateTestUser()
  })

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await client.post('/auth/register', testUser)
      
      assertApiResponse(response, 201)
      expect(response.data.data).toHaveProperty('id')
      expect(response.data.data).toHaveProperty('email', testUser.email)
      expect(response.data.data).not.toHaveProperty('password')
    })

    it('should not register user with duplicate email', async () => {
      // First registration
      await client.post('/auth/register', testUser)
      
      // Second registration with same email should fail
      try {
        await client.post('/auth/register', testUser)
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(409)
        assertApiError(error.response, 409)
      }
    })

    it('should login with valid credentials', async () => {
      // Register user first
      await client.post('/auth/register', testUser)
      
      // Login
      const response = await client.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      })
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('token')
      expect(response.data.data).toHaveProperty('user')
      expect(response.data.data.user).toHaveProperty('email', testUser.email)
      
      authToken = response.data.data.token
    })

    it('should not login with invalid credentials', async () => {
      try {
        await client.post('/auth/login', {
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        })
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        assertApiError(error.response, 401)
      }
    })

    it('should refresh token', async () => {
      // Register and login first
      await client.post('/auth/register', testUser)
      const loginResponse = await client.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      })
      
      const token = loginResponse.data.data.token
      client.setAuthToken(token)
      
      // Refresh token
      const response = await client.post('/auth/refresh')
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('token')
      expect(response.data.data.token).not.toBe(token)
    })
  })

  describe('User Profile', () => {
    beforeEach(async () => {
      // Setup authenticated user
      await client.post('/auth/register', testUser)
      const loginResponse = await client.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      })
      authToken = loginResponse.data.data.token
      client.setAuthToken(authToken)
    })

    it('should get current user profile', async () => {
      const response = await client.get('/users/me')
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('id')
      expect(response.data.data).toHaveProperty('email', testUser.email)
      expect(response.data.data).toHaveProperty('firstName', testUser.firstName)
      expect(response.data.data).toHaveProperty('lastName', testUser.lastName)
      expect(response.data.data).not.toHaveProperty('password')
    })

    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio',
      }
      
      const response = await client.patch('/users/me', updateData)
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('firstName', updateData.firstName)
      expect(response.data.data).toHaveProperty('lastName', updateData.lastName)
      expect(response.data.data).toHaveProperty('bio', updateData.bio)
    })

    it('should get user by username', async () => {
      const response = await client.get(`/users/${testUser.username}`)
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('username', testUser.username)
      expect(response.data.data).toHaveProperty('firstName', testUser.firstName)
      expect(response.data.data).not.toHaveProperty('email') // Email should be private
    })

    it('should not access profile without authentication', async () => {
      client.clearAuth()
      
      try {
        await client.get('/users/me')
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(401)
        assertApiError(error.response, 401)
      }
    })
  })

  describe('User Interactions', () => {
    let otherUser: any
    let otherUserId: string

    beforeEach(async () => {
      // Setup first user
      await client.post('/auth/register', testUser)
      const loginResponse = await client.post('/auth/login', {
        email: testUser.email,
        password: testUser.password,
      })
      client.setAuthToken(loginResponse.data.data.token)

      // Setup second user
      otherUser = generateTestUser()
      const registerResponse = await client.post('/auth/register', otherUser)
      otherUserId = registerResponse.data.data.id
    })

    it('should follow another user', async () => {
      const response = await client.post(`/users/${otherUserId}/follow`)
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('following', true)
    })

    it('should unfollow another user', async () => {
      // Follow first
      await client.post(`/users/${otherUserId}/follow`)
      
      // Then unfollow
      const response = await client.delete(`/users/${otherUserId}/follow`)
      
      assertApiResponse(response)
      expect(response.data.data).toHaveProperty('following', false)
    })

    it('should get user followers', async () => {
      // Follow the other user
      await client.post(`/users/${otherUserId}/follow`)
      
      // Get followers of other user
      const response = await client.get(`/users/${otherUserId}/followers`)
      
      assertApiResponse(response)
      expect(response.data.data).toBeInstanceOf(Array)
      expect(response.data.data.length).toBeGreaterThan(0)
    })

    it('should get user following', async () => {
      // Follow the other user
      await client.post(`/users/${otherUserId}/follow`)
      
      // Get current user's following list
      const response = await client.get('/users/me/following')
      
      assertApiResponse(response)
      expect(response.data.data).toBeInstanceOf(Array)
      expect(response.data.data.length).toBeGreaterThan(0)
    })
  })

  describe('User Search', () => {
    beforeEach(async () => {
      // Create multiple test users
      const users = [
        generateTestUser({ firstName: 'John', lastName: 'Doe', username: 'johndoe' }),
        generateTestUser({ firstName: 'Jane', lastName: 'Smith', username: 'janesmith' }),
        generateTestUser({ firstName: 'Bob', lastName: 'Johnson', username: 'bobjohnson' }),
      ]

      for (const user of users) {
        await client.post('/auth/register', user)
      }
    })

    it('should search users by name', async () => {
      const response = await client.get('/users/search?q=John')
      
      assertApiResponse(response)
      expect(response.data.data).toBeInstanceOf(Array)
      
      const johnUsers = response.data.data.filter((user: any) => 
        user.firstName.includes('John') || user.lastName.includes('John')
      )
      expect(johnUsers.length).toBeGreaterThan(0)
    })

    it('should search users by username', async () => {
      const response = await client.get('/users/search?q=jane')
      
      assertApiResponse(response)
      expect(response.data.data).toBeInstanceOf(Array)
      
      const janeUsers = response.data.data.filter((user: any) => 
        user.username.includes('jane')
      )
      expect(janeUsers.length).toBeGreaterThan(0)
    })

    it('should return empty results for no matches', async () => {
      const response = await client.get('/users/search?q=nonexistentuser123')
      
      assertApiResponse(response)
      expect(response.data.data).toBeInstanceOf(Array)
      expect(response.data.data.length).toBe(0)
    })
  })

  describe('User Validation', () => {
    it('should validate email format', async () => {
      const invalidUser = generateTestUser({ email: 'invalid-email' })
      
      try {
        await client.post('/auth/register', invalidUser)
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        assertApiError(error.response, 400)
      }
    })

    it('should validate password strength', async () => {
      const weakPasswordUser = generateTestUser({ password: '123' })
      
      try {
        await client.post('/auth/register', weakPasswordUser)
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        assertApiError(error.response, 400)
      }
    })

    it('should validate required fields', async () => {
      const incompleteUser = { email: 'test@example.com' }
      
      try {
        await client.post('/auth/register', incompleteUser)
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.response.status).toBe(400)
        assertApiError(error.response, 400)
      }
    })
  })
})