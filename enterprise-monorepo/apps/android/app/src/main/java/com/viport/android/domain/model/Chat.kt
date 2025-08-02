package com.viport.android.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize

@Parcelize
data class ChatRoom(
    val id: String,
    val type: ChatType,
    val name: String?,
    val description: String?,
    val avatarUrl: String?,
    val participants: List<User> = emptyList(),
    val lastMessage: Message?,
    val unreadCount: Int = 0,
    val isArchived: Boolean = false,
    val isMuted: Boolean = false,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class Message(
    val id: String,
    val chatRoomId: String,
    val senderId: String,
    val sender: User?,
    val content: String?,
    val type: MessageType,
    val mediaItems: List<MediaItem> = emptyList(),
    val replyToMessageId: String?,
    val replyToMessage: Message?,
    val isEdited: Boolean = false,
    val isDeleted: Boolean = false,
    val readBy: List<MessageRead> = emptyList(),
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class MessageRead(
    val userId: String,
    val readAt: String
) : Parcelable

@Parcelize
data class TypingIndicator(
    val chatRoomId: String,
    val userId: String,
    val user: User?,
    val isTyping: Boolean,
    val timestamp: String
) : Parcelable

enum class ChatType {
    DIRECT, GROUP, CHANNEL
}

enum class MessageType {
    TEXT, IMAGE, VIDEO, AUDIO, FILE, LOCATION, STICKER, SYSTEM
}