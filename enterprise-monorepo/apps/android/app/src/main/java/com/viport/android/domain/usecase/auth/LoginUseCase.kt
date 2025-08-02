package com.viport.android.domain.usecase.auth

import com.viport.android.domain.model.User
import com.viport.android.domain.repository.AuthRepository
import com.viport.android.domain.util.Resource
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(email: String, password: String): Resource<User> {
        if (email.isBlank()) {
            return Resource.Error("Email cannot be empty")
        }
        
        if (password.isBlank()) {
            return Resource.Error("Password cannot be empty")
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return Resource.Error("Invalid email format")
        }
        
        if (password.length < 8) {
            return Resource.Error("Password must be at least 8 characters")
        }
        
        return authRepository.login(email, password)
    }
}