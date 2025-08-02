package com.viport.android.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("data")
    val data: T?,
    @SerializedName("message")
    val message: String?,
    @SerializedName("error")
    val error: String?,
    @SerializedName("timestamp")
    val timestamp: String?
)

data class PaginatedResponse<T>(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("data")
    val data: List<T>,
    @SerializedName("pagination")
    val pagination: PaginationDto,
    @SerializedName("message")
    val message: String?,
    @SerializedName("error")
    val error: String?
)

data class PaginationDto(
    @SerializedName("currentPage")
    val currentPage: Int,
    @SerializedName("totalPages")
    val totalPages: Int,
    @SerializedName("pageSize")
    val pageSize: Int,
    @SerializedName("totalItems")
    val totalItems: Int,
    @SerializedName("hasNext")
    val hasNext: Boolean,
    @SerializedName("hasPrevious")
    val hasPrevious: Boolean
)