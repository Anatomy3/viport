package com.viport.ui.profile.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.*
import com.viport.domain.model.Post
import com.viport.domain.model.User
import com.viport.domain.repository.PostRepository
import com.viport.domain.repository.UserRepository
import com.viport.domain.usecase.FollowUserUseCase
import com.viport.domain.usecase.GetUserPostsUseCase
import com.viport.domain.usecase.GetUserProfileUseCase
import com.viport.domain.usecase.UnfollowUserUseCase
import com.viport.ui.profile.components.ProfileTab
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProfileUiState(
    val user: User? = null,
    val isOwnProfile: Boolean = false,
    val isFollowing: Boolean = false,
    val selectedTab: ProfileTab = ProfileTab.POSTS,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val getUserProfileUseCase: GetUserProfileUseCase,
    private val getUserPostsUseCase: GetUserPostsUseCase,
    private val followUserUseCase: FollowUserUseCase,
    private val unfollowUserUseCase: UnfollowUserUseCase,
    private val userRepository: UserRepository,
    private val postRepository: PostRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()
    
    private val _currentUserId = MutableStateFlow<String?>(null)
    
    val posts: Flow<PagingData<Post>> = _currentUserId
        .filterNotNull()
        .flatMapLatest { userId ->
            Pager(
                config = PagingConfig(
                    pageSize = 20,
                    enablePlaceholders = false,
                    prefetchDistance = 5
                ),
                pagingSourceFactory = {
                    ProfilePostsPagingSource(
                        postRepository = postRepository,
                        userId = userId,
                        tabType = _uiState.value.selectedTab
                    )
                }
            ).flow
        }
        .cachedIn(viewModelScope)
    
    fun loadProfile(userId: String) {
        _currentUserId.value = userId
        
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                // Get current user to check if it's own profile
                val currentUser = userRepository.getCurrentUser()
                val isOwnProfile = currentUser?.id == userId
                
                // Get profile user
                val profileUser = getUserProfileUseCase(userId)
                
                // Check if following (only if not own profile)
                val isFollowing = if (!isOwnProfile) {
                    userRepository.isFollowing(userId)
                } else {
                    false
                }
                
                _uiState.update {
                    it.copy(
                        user = profileUser,
                        isOwnProfile = isOwnProfile,
                        isFollowing = isFollowing,
                        isLoading = false,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load profile"
                    )
                }
            }
        }
    }
    
    fun toggleFollow() {
        val currentState = _uiState.value
        val userId = currentState.user?.id ?: return
        
        viewModelScope.launch {
            try {
                if (currentState.isFollowing) {
                    unfollowUserUseCase(userId)
                    // Update follower count optimistically
                    _uiState.update {
                        it.copy(
                            isFollowing = false,
                            user = it.user?.copy(
                                followersCount = maxOf(0, (it.user.followersCount ?: 0) - 1)
                            )
                        )
                    }
                } else {
                    followUserUseCase(userId)
                    // Update follower count optimistically
                    _uiState.update {
                        it.copy(
                            isFollowing = true,
                            user = it.user?.copy(
                                followersCount = (it.user.followersCount ?: 0) + 1
                            )
                        )
                    }
                }
            } catch (e: Exception) {
                // Revert optimistic update on error
                _uiState.update {
                    it.copy(
                        isFollowing = !currentState.isFollowing,
                        user = currentState.user,
                        error = e.message ?: "Failed to update follow status"
                    )
                }
            }
        }
    }
    
    fun selectTab(tab: ProfileTab) {
        _uiState.update { it.copy(selectedTab = tab) }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
    
    fun refreshProfile() {
        _currentUserId.value?.let { userId ->
            loadProfile(userId)
        }
    }
}

class ProfilePostsPagingSource(
    private val postRepository: PostRepository,
    private val userId: String,
    private val tabType: ProfileTab
) : PagingSource<Int, Post>() {
    
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Post> {
        return try {
            val page = params.key ?: 0
            val pageSize = params.loadSize
            
            val posts = when (tabType) {
                ProfileTab.POSTS -> postRepository.getUserPosts(
                    userId = userId,
                    page = page,
                    pageSize = pageSize
                )
                ProfileTab.SAVED -> postRepository.getUserSavedPosts(
                    userId = userId,
                    page = page,
                    pageSize = pageSize
                )
                ProfileTab.TAGGED -> postRepository.getUserTaggedPosts(
                    userId = userId,
                    page = page,
                    pageSize = pageSize
                )
            }
            
            LoadResult.Page(
                data = posts,
                prevKey = if (page == 0) null else page - 1,
                nextKey = if (posts.isEmpty() || posts.size < pageSize) null else page + 1
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
    
    override fun getRefreshKey(state: PagingState<Int, Post>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }
}