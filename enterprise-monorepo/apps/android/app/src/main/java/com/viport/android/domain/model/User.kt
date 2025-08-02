package com.viport.android.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class User(
    val id: String,
    val username: String,
    val email: String,
    val firstName: String?,
    val lastName: String?,
    val displayName: String,
    val avatarUrl: String?,
    val bio: String?,
    val isVerified: Boolean = false,
    val isCreator: Boolean = false,
    val verificationLevel: VerificationLevel = VerificationLevel.EMAIL,
    val accountType: AccountType = AccountType.PERSONAL,
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val postsCount: Int = 0,
    val location: String?,
    val website: String?,
    val socialLinks: List<SocialLink> = emptyList(),
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class SocialLink(
    val platform: String,
    val url: String
) : Parcelable

enum class VerificationLevel {
    EMAIL, PHONE, IDENTITY, PREMIUM
}

enum class AccountType {
    PERSONAL, BUSINESS, CREATOR, ORGANIZATION
}