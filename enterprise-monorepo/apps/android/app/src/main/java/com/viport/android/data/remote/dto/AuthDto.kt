package com.viport.android.data.remote.dto

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String
)

data class RegisterRequest(
    @SerializedName("email")
    val email: String,
    @SerializedName("password")
    val password: String,
    @SerializedName("firstName")
    val firstName: String,
    @SerializedName("lastName")
    val lastName: String,
    @SerializedName("username")
    val username: String
)

data class GoogleSignInRequest(
    @SerializedName("idToken")
    val idToken: String
)

data class AuthResponse(
    @SerializedName("user")
    val user: UserDto,
    @SerializedName("token")
    val token: String,
    @SerializedName("refreshToken")
    val refreshToken: String,
    @SerializedName("expiresAt")
    val expiresAt: String
)

data class RefreshTokenRequest(
    @SerializedName("refreshToken")
    val refreshToken: String
)

data class RefreshTokenResponse(
    @SerializedName("token")
    val token: String,
    @SerializedName("expiresAt")
    val expiresAt: String
)

data class ChangePasswordRequest(
    @SerializedName("oldPassword")
    val oldPassword: String,
    @SerializedName("newPassword")
    val newPassword: String
)

data class ForgotPasswordRequest(
    @SerializedName("email")
    val email: String
)

data class VerifyEmailRequest(
    @SerializedName("token")
    val token: String
)