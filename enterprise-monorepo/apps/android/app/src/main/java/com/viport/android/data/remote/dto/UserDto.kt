package com.viport.android.data.remote.dto

import com.google.gson.annotations.SerializedName
import com.viport.android.domain.model.AccountType
import com.viport.android.domain.model.SocialLink
import com.viport.android.domain.model.User
import com.viport.android.domain.model.VerificationLevel

data class UserDto(
    @SerializedName("id")
    val id: String,
    @SerializedName("username")
    val username: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("firstName")
    val firstName: String?,
    @SerializedName("lastName")
    val lastName: String?,
    @SerializedName("displayName")
    val displayName: String,
    @SerializedName("avatarUrl")
    val avatarUrl: String?,
    @SerializedName("bio")
    val bio: String?,
    @SerializedName("isVerified")
    val isVerified: Boolean = false,
    @SerializedName("isCreator")
    val isCreator: Boolean = false,
    @SerializedName("verificationLevel")
    val verificationLevel: String = "email",
    @SerializedName("accountType")
    val accountType: String = "personal",
    @SerializedName("followersCount")
    val followersCount: Int = 0,
    @SerializedName("followingCount")
    val followingCount: Int = 0,
    @SerializedName("postsCount")
    val postsCount: Int = 0,
    @SerializedName("location")
    val location: String?,
    @SerializedName("website")
    val website: String?,
    @SerializedName("socialLinks")
    val socialLinks: List<SocialLinkDto> = emptyList(),
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("updatedAt")
    val updatedAt: String
)

data class SocialLinkDto(
    @SerializedName("platform")
    val platform: String,
    @SerializedName("url")
    val url: String
)

fun UserDto.toDomain(): User {
    return User(
        id = id,
        username = username,
        email = email,
        firstName = firstName,
        lastName = lastName,
        displayName = displayName,
        avatarUrl = avatarUrl,
        bio = bio,
        isVerified = isVerified,
        isCreator = isCreator,
        verificationLevel = when (verificationLevel.lowercase()) {
            "email" -> VerificationLevel.EMAIL
            "phone" -> VerificationLevel.PHONE
            "identity" -> VerificationLevel.IDENTITY
            "premium" -> VerificationLevel.PREMIUM
            else -> VerificationLevel.EMAIL
        },
        accountType = when (accountType.lowercase()) {
            "personal" -> AccountType.PERSONAL
            "business" -> AccountType.BUSINESS
            "creator" -> AccountType.CREATOR
            "organization" -> AccountType.ORGANIZATION
            else -> AccountType.PERSONAL
        },
        followersCount = followersCount,
        followingCount = followingCount,
        postsCount = postsCount,
        location = location,
        website = website,
        socialLinks = socialLinks.map { 
            SocialLink(platform = it.platform, url = it.url) 
        },
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun User.toDto(): UserDto {
    return UserDto(
        id = id,
        username = username,
        email = email,
        firstName = firstName,
        lastName = lastName,
        displayName = displayName,
        avatarUrl = avatarUrl,
        bio = bio,
        isVerified = isVerified,
        isCreator = isCreator,
        verificationLevel = verificationLevel.name.lowercase(),
        accountType = accountType.name.lowercase(),
        followersCount = followersCount,
        followingCount = followingCount,
        postsCount = postsCount,
        location = location,
        website = website,
        socialLinks = socialLinks.map { 
            SocialLinkDto(platform = it.platform, url = it.url) 
        },
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}