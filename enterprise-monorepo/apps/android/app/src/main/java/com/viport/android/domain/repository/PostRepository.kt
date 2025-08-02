package com.viport.android.domain.repository

import androidx.paging.PagingData
import com.viport.android.domain.model.Comment
import com.viport.android.domain.model.Post
import com.viport.android.domain.model.User
import com.viport.android.domain.util.Resource
import kotlinx.coroutines.flow.Flow

interface PostRepository {
    
    fun getFeedPosts(): Flow<PagingData<Post>>
    
    fun getUserPosts(userId: String): Flow<PagingData<Post>>
    
    fun getExplorePosts(): Flow<PagingData<Post>>
    
    suspend fun getPostById(postId: String): Resource<Post>
    
    suspend fun createPost(
        content: String,
        mediaItems: List<String>, // File paths
        tags: List<String>,
        location: String?
    ): Resource<Post>
    
    suspend fun updatePost(
        postId: String,
        content: String,
        tags: List<String>,
        location: String?
    ): Resource<Post>
    
    suspend fun deletePost(postId: String): Resource<Unit>
    
    suspend fun likePost(postId: String): Resource<Unit>
    
    suspend fun unlikePost(postId: String): Resource<Unit>
    
    suspend fun bookmarkPost(postId: String): Resource<Unit>
    
    suspend fun unbookmarkPost(postId: String): Resource<Unit>
    
    suspend fun sharePost(postId: String): Resource<Unit>
    
    suspend fun reportPost(postId: String, reason: String): Resource<Unit>
    
    // Comments
    fun getPostComments(postId: String): Flow<PagingData<Comment>>
    
    suspend fun addComment(postId: String, content: String, parentCommentId: String? = null): Resource<Comment>
    
    suspend fun deleteComment(commentId: String): Resource<Unit>
    
    suspend fun likeComment(commentId: String): Resource<Unit>
    
    suspend fun unlikeComment(commentId: String): Resource<Unit>
    
    // Search
    fun searchPosts(query: String): Flow<PagingData<Post>>
    
    fun getPostsByTag(tag: String): Flow<PagingData<Post>>
    
    // Bookmarks
    fun getBookmarkedPosts(): Flow<PagingData<Post>>
}