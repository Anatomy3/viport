package com.viport.android.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.math.BigDecimal

@Parcelize
data class Course(
    val id: String,
    val instructorId: String,
    val instructor: User?,
    val title: String,
    val description: String,
    val shortDescription: String,
    val price: BigDecimal?,
    val currency: String = "USD",
    val isFree: Boolean = false,
    val category: CourseCategory,
    val level: CourseLevel,
    val duration: Int, // in minutes
    val thumbnailUrl: String?,
    val previewVideoUrl: String?,
    val tags: List<String> = emptyList(),
    val learningObjectives: List<String> = emptyList(),
    val requirements: List<String> = emptyList(),
    val lessons: List<Lesson> = emptyList(),
    val studentsCount: Int = 0,
    val rating: Float = 0f,
    val reviewsCount: Int = 0,
    val isPublished: Boolean = false,
    val isFeatured: Boolean = false,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class Lesson(
    val id: String,
    val courseId: String,
    val title: String,
    val description: String?,
    val videoUrl: String?,
    val duration: Int, // in minutes
    val order: Int,
    val isFree: Boolean = false,
    val resources: List<LessonResource> = emptyList(),
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class LessonResource(
    val id: String,
    val title: String,
    val type: ResourceType,
    val url: String,
    val size: Long? // in bytes
) : Parcelable

@Parcelize
data class CourseProgress(
    val id: String,
    val courseId: String,
    val userId: String,
    val completedLessons: List<String> = emptyList(),
    val currentLessonId: String?,
    val progressPercentage: Float = 0f,
    val totalWatchTime: Int = 0, // in minutes
    val lastAccessedAt: String,
    val completedAt: String?,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class CourseEnrollment(
    val id: String,
    val courseId: String,
    val course: Course?,
    val userId: String,
    val user: User?,
    val enrolledAt: String,
    val expiresAt: String?,
    val progress: CourseProgress?
) : Parcelable

enum class CourseCategory {
    DESIGN, DEVELOPMENT, BUSINESS, MARKETING, PHOTOGRAPHY, 
    MUSIC, WRITING, LIFESTYLE, HEALTH, LANGUAGE, OTHER
}

enum class CourseLevel {
    BEGINNER, INTERMEDIATE, ADVANCED, ALL_LEVELS
}

enum class ResourceType {
    PDF, DOCUMENT, AUDIO, VIDEO, IMAGE, ARCHIVE, LINK
}