package com.viport.android.domain.usecase.auth

import com.viport.android.domain.model.User
import com.viport.android.domain.repository.AuthRepository
import com.viport.android.domain.util.Resource
import javax.inject.Inject

class RegisterUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(
        email: String,
        password: String,
        confirmPassword: String,
        firstName: String,
        lastName: String,
        username: String
    ): Resource<User> {
        
        // Validation
        if (email.isBlank()) {
            return Resource.Error("Email cannot be empty")
        }
        
        if (password.isBlank()) {
            return Resource.Error("Password cannot be empty")
        }
        
        if (confirmPassword.isBlank()) {
            return Resource.Error("Please confirm your password")
        }
        
        if (firstName.isBlank()) {
            return Resource.Error("First name cannot be empty")
        }
        
        if (lastName.isBlank()) {
            return Resource.Error("Last name cannot be empty")
        }
        
        if (username.isBlank()) {
            return Resource.Error("Username cannot be empty")
        }
        
        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            return Resource.Error("Invalid email format")
        }
        
        if (password.length < 8) {
            return Resource.Error("Password must be at least 8 characters")
        }
        
        if (password != confirmPassword) {
            return Resource.Error("Passwords do not match")
        }
        
        if (username.length < 3) {
            return Resource.Error("Username must be at least 3 characters")
        }
        
        if (!username.matches(Regex("^[a-zA-Z0-9_]+$"))) {
            return Resource.Error("Username can only contain letters, numbers, and underscores")
        }
        
        // Password strength validation
        val hasUppercase = password.any { it.isUpperCase() }
        val hasLowercase = password.any { it.isLowerCase() }
        val hasDigit = password.any { it.isDigit() }
        val hasSpecialChar = password.any { !it.isLetterOrDigit() }
        
        if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecialChar) {
            return Resource.Error("Password must contain at least one uppercase letter, lowercase letter, digit, and special character")
        }
        
        return authRepository.register(email, password, firstName, lastName, username)
    }
}