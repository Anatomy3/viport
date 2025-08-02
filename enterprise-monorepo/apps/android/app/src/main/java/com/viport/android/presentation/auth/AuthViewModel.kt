package com.viport.android.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.viport.android.domain.model.User
import com.viport.android.domain.usecase.auth.GoogleSignInUseCase
import com.viport.android.domain.usecase.auth.LoginUseCase
import com.viport.android.domain.usecase.auth.RegisterUseCase
import com.viport.android.domain.util.Resource
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
    private val googleSignInUseCase: GoogleSignInUseCase
) : ViewModel() {
    
    private val _loginState = MutableStateFlow(AuthState())
    val loginState: StateFlow<AuthState> = _loginState.asStateFlow()
    
    private val _registerState = MutableStateFlow(AuthState())
    val registerState: StateFlow<AuthState> = _registerState.asStateFlow()
    
    private val _googleSignInState = MutableStateFlow(AuthState())
    val googleSignInState: StateFlow<AuthState> = _googleSignInState.asStateFlow()
    
    fun login(email: String, password: String) {
        viewModelScope.launch {
            _loginState.value = _loginState.value.copy(isLoading = true, error = null)
            
            when (val result = loginUseCase(email, password)) {
                is Resource.Success -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        user = result.data,
                        isSuccess = true
                    )
                }
                is Resource.Error -> {
                    _loginState.value = _loginState.value.copy(
                        isLoading = false,
                        error = result.message
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
                }
                is Resource.Error -> {
                    _registerState.value = _registerState.value.copy(
                        isLoading = false,
                        error = result.message
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
                }
                is Resource.Error -> {
                    _googleSignInState.value = _googleSignInState.value.copy(
                        isLoading = false,
                        error = result.message
                    )
                }
                is Resource.Loading -> {
                    _googleSignInState.value = _googleSignInState.value.copy(isLoading = true)
                }
            }
        }
    }
    
    fun clearError() {
        _loginState.value = _loginState.value.copy(error = null)
        _registerState.value = _registerState.value.copy(error = null)
        _googleSignInState.value = _googleSignInState.value.copy(error = null)
    }
    
    fun resetSuccess() {
        _loginState.value = _loginState.value.copy(isSuccess = false)
        _registerState.value = _registerState.value.copy(isSuccess = false)
        _googleSignInState.value = _googleSignInState.value.copy(isSuccess = false)
    }
}

data class AuthState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)