package com.viport.ui.auth.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viport.domain.model.User
import com.viport.domain.usecase.auth.LoginUseCase
import com.viport.domain.usecase.auth.RegisterUseCase
import com.viport.domain.usecase.auth.GoogleSignInUseCase
import com.viport.domain.usecase.auth.LogoutUseCase
import com.viport.domain.repository.AuthRepository
import com.viport.domain.util.Resource
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val googleSignInUseCase: GoogleSignInUseCase,
    private val logoutUseCase: LogoutUseCase,
    private val authRepository: AuthRepository
) : ViewModel() {
    
    private val _loginState = MutableStateFlow(AuthState())
    val loginState: StateFlow<AuthState> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow(AuthState())
    val registerState: StateFlow<AuthState> = _registerState.asStateFlow()
    
    private val _googleSignInState = MutableStateFlow(AuthState())
    val googleSignInState: StateFlow<AuthState> = _googleSignInState.asStateFlow()
    
    private val _logoutState = MutableStateFlow(AuthState())
    val logoutState: StateFlow<AuthState> = _logoutState.asStateFlow()
    
    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()
    
    init {
        // Load current user on ViewModel creation
        getCurrentUser()
    }
    
    fun login(email: String, password: String, rememberMe: Boolean = false) {
        viewModelScope.launch {
            _loginState.value = _loginState.value.copy(isLoading = true, error = null)
            
            when (val result = loginUseCase(email, password)) {
                is Resource.Success -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        user = result.data,
                        isSuccess = true
                    )
                    _currentUser.value = result.data
                    
                    // Handle remember me functionality
                    if (rememberMe) {
                        // Store remember me preference
                        // This would be handled by the repository
                    }
                }
                is Resource.Error -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        error = result.message ?: "Login failed"
                    )
                }
                is Resource.Loading -> {
                    _loginState.value = _loginState.value.copy(isLoading = true)
                }
            }
        }
    }
    
    fun register(
        email: String,
        password: String,
        confirmPassword: String,
        firstName: String,
        lastName: String,
        username: String
    ) {
        viewModelScope.launch {
            _registerState.value = _registerState.value.copy(isLoading = true, error = null)
            
            when (val result = registerUseCase(email, password, confirmPassword, firstName, lastName, username)) {
                is Resource.Success -> {
                    _registerState.value = _registerState.value.copy(
                        isLoading = false,
                        user = result.data,
                        isSuccess = true
                    )
                    _currentUser.value = result.data
                }
                is Resource.Error -> {
                    _registerState.value = _registerState.value.copy(
                        isLoading = false,
                        error = result.message ?: "Registration failed"
                    )
                }
                is Resource.Loading -> {
                    _registerState.value = _registerState.value.copy(isLoading = true)
                }
            }
        }
    }
    
    fun signInWithGoogle(idToken: String) {
        viewModelScope.launch {
            _googleSignInState.value = _googleSignInState.value.copy(isLoading = true, error = null)
            
            when (val result = googleSignInUseCase(idToken)) {
                is Resource.Success -> {
                    _googleSignInState.value = _googleSignInState.value.copy(
                        isLoading = false,
                        user = result.data,
                        isSuccess = true
                    )
                    _currentUser.value = result.data
                }
                is Resource.Error -> {
                    _googleSignInState.value = _googleSignInState.value.copy(
                        isLoading = false,
                        error = result.message ?: "Google Sign-In failed"
                    )
                }
                is Resource.Loading -> {
                    _googleSignInState.value = _googleSignInState.value.copy(isLoading = true)
                }
            }
        }
    }
    
    fun logout() {
        viewModelScope.launch {
            _logoutState.value = _logoutState.value.copy(isLoading = true, error = null)
            
            when (val result = logoutUseCase()) {
                is Resource.Success -> {
                    _logoutState.value = _logoutState.value.copy(
                        isLoading = false,
                        isSuccess = true
                    )
                    _currentUser.value = null
                    clearAllStates()
                }
                is Resource.Error -> {
                    _logoutState.value = _logoutState.value.copy(
                        isLoading = false,
                        error = result.message ?: "Logout failed"
                    )
                }
                is Resource.Loading -> {
                    _logoutState.value = _logoutState.value.copy(isLoading = true)
                }
            }
        }
    }
    
    fun getCurrentUser() {
        viewModelScope.launch {
            when (val result = authRepository.getCurrentUser()) {
                is Resource.Success -> {
                    _currentUser.value = result.data
                }
                is Resource.Error -> {
                    _currentUser.value = null
                }
                is Resource.Loading -> {
                    // Handle loading if needed
                }
            }
        }
    }
    
    fun handleGoogleSignInError(errorMessage: String) {
        _googleSignInState.value = _googleSignInState.value.copy(
            isLoading = false,
            error = errorMessage
        )
    }
    
    fun clearError() {
        _loginState.value = _loginState.value.copy(error = null)
        _registerState.value = _registerState.value.copy(error = null)
        _googleSignInState.value = _googleSignInState.value.copy(error = null)
        _logoutState.value = _logoutState.value.copy(error = null)
    }
    
    fun resetSuccess() {
        _loginState.value = _loginState.value.copy(isSuccess = false)
        _registerState.value = _registerState.value.copy(isSuccess = false)
        _googleSignInState.value = _googleSignInState.value.copy(isSuccess = false)
        _logoutState.value = _logoutState.value.copy(isSuccess = false)
    }
    
    private fun clearAllStates() {
        _loginState.value = AuthState()
        _registerState.value = AuthState()
        _googleSignInState.value = AuthState()
        _logoutState.value = AuthState()
    }
    
    fun checkAuthenticationStatus() = authRepository.isLoggedIn()
}

data class AuthState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)