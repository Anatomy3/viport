package com.viport.android.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class Post(
    val id: String,
    val userId: String,
    val user: User?,
    val content: String,
    val mediaItems: List<MediaItem> = emptyList(),
    val tags: List<String> = emptyList(),
    val likesCount: Int = 0,
    val commentsCount: Int = 0,
    val sharesCount: Int = 0,
    val isLiked: Boolean = false,
    val isBookmarked: Boolean = false,
    val visibility: PostVisibility = PostVisibility.PUBLIC,
    val location: String?,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class MediaItem(
    val id: String,
    val type: MediaType,
    val url: String,
    val thumbnailUrl: String?,
    val duration: Int?, // For videos, in seconds
    val width: Int?,
    val height: Int?,
    val size: Long?, // File size in bytes
    val altText: String?
) : Parcelable

@Parcelize
data class Comment(
    val id: String,
    val postId: String,
    val userId: String,
    val user: User?,
    val content: String,
    val parentCommentId: String?, // For replies
    val likesCount: Int = 0,
    val isLiked: Boolean = false,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

enum class MediaType {
    IMAGE, VIDEO, AUDIO, DOCUMENT
}

enum class PostVisibility {
    PUBLIC, FOLLOWERS, PRIVATE
}