package com.viport.android.domain.repository

import com.viport.android.domain.model.User
import com.viport.android.domain.util.Resource
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    
    suspend fun login(email: String, password: String): Resource<User>
    
    suspend fun register(
        email: String,
        password: String,
        firstName: String,
        lastName: String,
        username: String
    ): Resource<User>
    
    suspend fun loginWithGoogle(idToken: String): Resource<User>
    
    suspend fun logout(): Resource<Unit>
    
    suspend fun refreshToken(): Resource<String>
    
    suspend fun getCurrentUser(): Resource<User?>
    
    suspend fun updateProfile(user: User): Resource<User>
    
    suspend fun changePassword(oldPassword: String, newPassword: String): Resource<Unit>
    
    suspend fun forgotPassword(email: String): Resource<Unit>
    
    suspend fun verifyEmail(token: String): Resource<Unit>
    
    suspend fun enableBiometric(): Resource<Unit>
    
    suspend fun authenticateWithBiometric(): Resource<User>
    
    fun isLoggedIn(): Flow<Boolean>
    
    fun getCurrentUserFlow(): Flow<User?>
    
    suspend fun deleteAccount(): Resource<Unit>
}