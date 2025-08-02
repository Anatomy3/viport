package com.viport.android.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.viport.android.data.local.dao.UserDao
import com.viport.android.data.local.entity.toEntity
import com.viport.android.data.remote.api.AuthApi
import com.viport.android.data.remote.dto.*
import com.viport.android.domain.model.User
import com.viport.android.domain.repository.AuthRepository
import com.viport.android.domain.util.Resource
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val authApi: AuthApi,
    private val userDao: UserDao,
    @ApplicationContext private val context: Context
) : AuthRepository {
    
    private val dataStore = context.dataStore
    
    companion object {
        private val TOKEN_KEY = stringPreferencesKey("auth_token")
        private val REFRESH_TOKEN_KEY = stringPreferencesKey("refresh_token")
        private val USER_ID_KEY = stringPreferencesKey("user_id")
    }
    
    override suspend fun login(email: String, password: String): Resource<User> {
        return try {
            val response = authApi.login(LoginRequest(email, password))
            if (response.isSuccessful && response.body()?.success == true) {
                val authResponse = response.body()!!.data!!
                
                // Save tokens
                saveAuthData(authResponse.token, authResponse.refreshToken, authResponse.user.id)
                
                // Cache user
                userDao.insertUser(authResponse.user.toDomain().toEntity())
                
                Resource.Success(authResponse.user.toDomain())
            } else {
                Resource.Error(response.body()?.error ?: "Login failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        username: String
    ): Resource<User> {
        return try {
            val response = authApi.register(
                RegisterRequest(email, password, firstName, lastName, username)
            )
            if (response.isSuccessful && response.body()?.success == true) {
                val authResponse = response.body()!!.data!!
                
                // Save tokens
                saveAuthData(authResponse.token, authResponse.refreshToken, authResponse.user.id)
                
                // Cache user
                userDao.insertUser(authResponse.user.toDomain().toEntity())
                
                Resource.Success(authResponse.user.toDomain())
            } else {
                Resource.Error(response.body()?.error ?: "Registration failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun loginWithGoogle(idToken: String): Resource<User> {
        return try {
            val response = authApi.googleSignIn(GoogleSignInRequest(idToken))
            if (response.isSuccessful && response.body()?.success == true) {
                val authResponse = response.body()!!.data!!
                
                // Save tokens
                saveAuthData(authResponse.token, authResponse.refreshToken, authResponse.user.id)
                
                // Cache user
                userDao.insertUser(authResponse.user.toDomain().toEntity())
                
                Resource.Success(authResponse.user.toDomain())
            } else {
                Resource.Error(response.body()?.error ?: "Google sign-in failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun logout(): Resource<Unit> {
        return try {
            authApi.logout()
            clearAuthData()
            userDao.clearAll()
            Resource.Success(Unit)
        } catch (e: Exception) {
            // Clear local data even if API call fails
            clearAuthData()
            userDao.clearAll()
            Resource.Success(Unit)
        }
    }
    
    override suspend fun refreshToken(): Resource<String> {
        return try {
            val refreshToken = getRefreshToken()
            if (refreshToken != null) {
                val response = authApi.refreshToken(RefreshTokenRequest(refreshToken))
                if (response.isSuccessful && response.body()?.success == true) {
                    val newToken = response.body()!!.data!!.token
                    saveToken(newToken)
                    Resource.Success(newToken)
                } else {
                    Resource.Error("Token refresh failed")
                }
            } else {
                Resource.Error("No refresh token available")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun getCurrentUser(): Resource<User?> {
        return try {
            val userId = getUserId()
            if (userId != null) {
                // Try to get from cache first
                val cachedUser = userDao.getUserById(userId)
                if (cachedUser != null) {
                    return Resource.Success(cachedUser.toDomain())
                }
                
                // Fetch from API
                val response = authApi.getCurrentUser()
                if (response.isSuccessful && response.body()?.success == true) {
                    val user = response.body()!!.data!!.toDomain()
                    userDao.insertUser(user.toEntity())
                    Resource.Success(user)
                } else {
                    Resource.Error(response.body()?.error ?: "Failed to get current user")
                }
            } else {
                Resource.Success(null)
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun updateProfile(user: User): Resource<User> {
        return try {
            val response = authApi.updateProfile(user.toDto())
            if (response.isSuccessful && response.body()?.success == true) {
                val updatedUser = response.body()!!.data!!.toDomain()
                userDao.updateUser(updatedUser.toEntity())
                Resource.Success(updatedUser)
            } else {
                Resource.Error(response.body()?.error ?: "Profile update failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun changePassword(oldPassword: String, newPassword: String): Resource<Unit> {
        return try {
            val response = authApi.changePassword(ChangePasswordRequest(oldPassword, newPassword))
            if (response.isSuccessful && response.body()?.success == true) {
                Resource.Success(Unit)
            } else {
                Resource.Error(response.body()?.error ?: "Password change failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun forgotPassword(email: String): Resource<Unit> {
        return try {
            val response = authApi.forgotPassword(ForgotPasswordRequest(email))
            if (response.isSuccessful && response.body()?.success == true) {
                Resource.Success(Unit)
            } else {
                Resource.Error(response.body()?.error ?: "Password reset failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun verifyEmail(token: String): Resource<Unit> {
        return try {
            val response = authApi.verifyEmail(VerifyEmailRequest(token))
            if (response.isSuccessful && response.body()?.success == true) {
                Resource.Success(Unit)
            } else {
                Resource.Error(response.body()?.error ?: "Email verification failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    override suspend fun enableBiometric(): Resource<Unit> {
        // Implementation depends on biometric authentication setup
        return Resource.Success(Unit)
    }
    
    override suspend fun authenticateWithBiometric(): Resource<User> {
        // Implementation depends on biometric authentication
        return getCurrentUser().let { result ->
            when (result) {
                is Resource.Success -> result
                is Resource.Error -> Resource.Error("Biometric authentication failed")
                is Resource.Loading -> Resource.Error("Authentication in progress")
            }
        }
    }
    
    override fun isLoggedIn(): Flow<Boolean> {
        return dataStore.data.map { preferences ->
            preferences[TOKEN_KEY] != null
        }
    }
    
    override fun getCurrentUserFlow(): Flow<User?> {
        return dataStore.data.map { preferences ->
            val userId = preferences[USER_ID_KEY]
            userId
        }.map { userId ->
            if (userId != null) {
                userDao.getUserById(userId)?.toDomain()
            } else {
                null
            }
        }
    }
    
    override suspend fun deleteAccount(): Resource<Unit> {
        return try {
            val response = authApi.deleteAccount()
            if (response.isSuccessful && response.body()?.success == true) {
                clearAuthData()
                userDao.clearAll()
                Resource.Success(Unit)
            } else {
                Resource.Error(response.body()?.error ?: "Account deletion failed")
            }
        } catch (e: Exception) {
            Resource.Error(e.message ?: "Network error")
        }
    }
    
    private suspend fun saveAuthData(token: String, refreshToken: String, userId: String) {
        dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
            preferences[REFRESH_TOKEN_KEY] = refreshToken
            preferences[USER_ID_KEY] = userId
        }
    }
    
    private suspend fun saveToken(token: String) {
        dataStore.edit { preferences ->
            preferences[TOKEN_KEY] = token
        }
    }
    
    private suspend fun clearAuthData() {
        dataStore.edit { preferences ->
            preferences.remove(TOKEN_KEY)
            preferences.remove(REFRESH_TOKEN_KEY)
            preferences.remove(USER_ID_KEY)
        }
    }
    
    private suspend fun getToken(): String? {
        return dataStore.data.first()[TOKEN_KEY]
    }
    
    private suspend fun getRefreshToken(): String? {
        return dataStore.data.first()[REFRESH_TOKEN_KEY]
    }
    
    private suspend fun getUserId(): String? {
        return dataStore.data.first()[USER_ID_KEY]
    }
}