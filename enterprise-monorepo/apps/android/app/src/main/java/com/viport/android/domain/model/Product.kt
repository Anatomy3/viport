package com.viport.android.domain.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.math.BigDecimal

@Parcelize
data class Product(
    val id: String,
    val sellerId: String,
    val seller: User?,
    val title: String,
    val description: String,
    val price: BigDecimal,
    val currency: String = "USD",
    val category: ProductCategory,
    val subcategory: String?,
    val tags: List<String> = emptyList(),
    val mediaItems: List<MediaItem> = emptyList(),
    val downloadUrl: String?, // For digital products
    val previewUrl: String?, // For digital products
    val isDigital: Boolean = true,
    val stockQuantity: Int?, // For physical products
    val salesCount: Int = 0,
    val rating: Float = 0f,
    val reviewsCount: Int = 0,
    val isActive: Boolean = true,
    val isFeatured: Boolean = false,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class Purchase(
    val id: String,
    val buyerId: String,
    val buyer: User?,
    val product: Product,
    val amount: BigDecimal,
    val currency: String,
    val status: PurchaseStatus,
    val transactionId: String?,
    val downloadCount: Int = 0,
    val maxDownloads: Int = 3,
    val expiresAt: String?, // For limited-time access
    val createdAt: String,
    val updatedAt: String
) : Parcelable

@Parcelize
data class Review(
    val id: String,
    val productId: String,
    val userId: String,
    val user: User?,
    val rating: Int, // 1-5 stars
    val comment: String?,
    val isVerifiedPurchase: Boolean = false,
    val helpfulCount: Int = 0,
    val createdAt: String,
    val updatedAt: String
) : Parcelable

enum class ProductCategory {
    DIGITAL_ART, PHOTOGRAPHY, DESIGN_TEMPLATES, MUSIC, SOFTWARE, 
    COURSES, EBOOKS, PRESETS, FONTS, ICONS, VIDEOS, OTHER
}

enum class PurchaseStatus {
    PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED
}