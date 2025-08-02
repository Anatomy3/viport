package com.viport.android.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.viport.android.data.local.converter.StringListConverter
import com.viport.android.domain.model.AccountType
import com.viport.android.domain.model.SocialLink
import com.viport.android.domain.model.User
import com.viport.android.domain.model.VerificationLevel

@Entity(tableName = "users")
@TypeConverters(StringListConverter::class)
data class UserEntity(
    @PrimaryKey
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
    val verificationLevel: String = "EMAIL",
    val accountType: String = "PERSONAL",
    val followersCount: Int = 0,
    val followingCount: Int = 0,
    val postsCount: Int = 0,
    val location: String?,
    val website: String?,
    val socialLinks: String?, // JSON string
    val createdAt: String,
    val updatedAt: String,
    val cachedAt: Long = System.currentTimeMillis()
)

fun UserEntity.toDomain(): User {
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
        verificationLevel = VerificationLevel.valueOf(verificationLevel),
        accountType = AccountType.valueOf(accountType),
        followersCount = followersCount,
        followingCount = followingCount,
        postsCount = postsCount,
        location = location,
        website = website,
        socialLinks = emptyList(), // Parse JSON if needed
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

fun User.toEntity(): UserEntity {
    return UserEntity(
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
        verificationLevel = verificationLevel.name,
        accountType = accountType.name,
        followersCount = followersCount,
        followingCount = followingCount,
        postsCount = postsCount,
        location = location,
        website = website,
        socialLinks = null, // Convert to JSON if needed
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}