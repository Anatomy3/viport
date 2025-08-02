package com.viport.android.domain.usecase.auth

import com.viport.android.domain.model.User
import com.viport.android.domain.repository.AuthRepository
import com.viport.android.domain.util.Resource
import javax.inject.Inject

class GoogleSignInUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(idToken: String): Resource<User> {
        if (idToken.isBlank()) {
            return Resource.Error("Invalid Google ID token")
        }
        
        return authRepository.loginWithGoogle(idToken)
    }
}