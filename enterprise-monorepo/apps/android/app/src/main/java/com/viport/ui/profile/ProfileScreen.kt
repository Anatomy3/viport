package com.viport.ui.profile

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import coil.compose.AsyncImage
import com.viport.domain.model.Post
import com.viport.domain.model.User
import com.viport.ui.components.common.ErrorCard
import com.viport.ui.components.common.LoadingCard
import com.viport.ui.profile.components.*
import com.viport.ui.profile.viewmodel.ProfileViewModel

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ProfileScreen(
    userId: String?,
    onPostClick: (String) -> Unit,
    onFollowersClick: () -> Unit,
    onFollowingClick: () -> Unit,
    onEditProfile: () -> Unit,
    onSettingsClick: () -> Unit,
    onBackClick: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val posts = viewModel.posts.collectAsLazyPagingItems()
    val lazyListState = rememberLazyListState()
    
    // Parallax scroll effect for header
    val scrollOffset = remember { Animatable(0f) }
    val headerHeight = 280.dp
    val headerHeightPx = with(LocalDensity.current) { headerHeight.toPx() }
    
    LaunchedEffect(userId) {
        if (userId != null) {
            viewModel.loadProfile(userId)
        }
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            state = lazyListState,
            modifier = Modifier.fillMaxSize()
        ) {
            // Profile Header with parallax effect
            item {
                ProfileHeader(
                    user = uiState.user,
                    isOwnProfile = uiState.isOwnProfile,
                    isFollowing = uiState.isFollowing,
                    onFollowClick = { viewModel.toggleFollow() },
                    onEditProfileClick = onEditProfile,
                    onFollowersClick = onFollowersClick,
                    onFollowingClick = onFollowingClick,
                    onMessageClick = { /* TODO */ },
                    modifier = Modifier.height(headerHeight)
                )
            }
            
            // Tab selector
            item {
                ProfileTabSelector(
                    selectedTab = uiState.selectedTab,
                    onTabSelected = { viewModel.selectTab(it) },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
            
            // Content based on selected tab
            when (uiState.selectedTab) {
                ProfileTab.POSTS -> {
                    if (posts.itemCount == 0) {
                        item {
                            EmptyProfileState(
                                isOwnProfile = uiState.isOwnProfile,
                                type = ProfileTab.POSTS,
                                onCreateClick = { /* TODO */ }
                            )
                        }
                    } else {
                        items(
                            count = posts.itemCount,
                            key = { index -> posts[index]?.id ?: index },
                            span = { GridItemSpan(1) }
                        ) { index ->
                            val post = posts[index]
                            if (post != null) {
                                ProfilePostItem(
                                    post = post,
                                    onClick = { onPostClick(post.id) },
                                    modifier = Modifier
                                        .animateItemPlacement()
                                        .padding(2.dp)
                                )
                            }
                        }
                    }
                }
                ProfileTab.SAVED -> {
                    item {
                        EmptyProfileState(
                            isOwnProfile = uiState.isOwnProfile,
                            type = ProfileTab.SAVED,
                            onCreateClick = { /* TODO */ }
                        )
                    }
                }
                ProfileTab.TAGGED -> {
                    item {
                        EmptyProfileState(
                            isOwnProfile = uiState.isOwnProfile,
                            type = ProfileTab.TAGGED,
                            onCreateClick = { /* TODO */ }
                        )
                    }
                }
            }
            
            // Loading state
            if (uiState.isLoading && posts.itemCount > 0) {
                item {
                    LoadingCard(
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
            
            // Error state
            uiState.error?.let { error ->
                item {
                    ErrorCard(
                        error = error,
                        onDismiss = { viewModel.clearError() },
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
        
        // Floating back button with glass effect
        AnimatedVisibility(
            visible = !uiState.isOwnProfile,
            enter = fadeIn() + slideInHorizontally(initialOffsetX = { -it }),
            exit = fadeOut() + slideOutHorizontally(targetOffsetX = { -it }),
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(16.dp)
        ) {
            FloatingActionButton(
                onClick = onBackClick,
                modifier = Modifier.size(48.dp),
                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                contentColor = MaterialTheme.colorScheme.onSurface,
                elevation = FloatingActionButtonDefaults.elevation(
                    defaultElevation = 8.dp
                )
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
        
        // Settings button for own profile
        AnimatedVisibility(
            visible = uiState.isOwnProfile,
            enter = fadeIn() + slideInHorizontally(initialOffsetX = { it }),
            exit = fadeOut() + slideOutHorizontally(targetOffsetX = { it }),
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(16.dp)
        ) {
            FloatingActionButton(
                onClick = onSettingsClick,
                modifier = Modifier.size(48.dp),
                containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
                contentColor = MaterialTheme.colorScheme.onSurface,
                elevation = FloatingActionButtonDefaults.elevation(
                    defaultElevation = 8.dp
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = "Settings",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
    }
}

@Composable
private fun ProfileHeader(
    user: User?,
    isOwnProfile: Boolean,
    isFollowing: Boolean,
    onFollowClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onFollowersClick: () -> Unit,
    onFollowingClick: () -> Unit,
    onMessageClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
                            MaterialTheme.colorScheme.primaryContainer
                        )
                    )
                )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Profile Avatar with border animation
                var isPressed by remember { mutableStateOf(false) }
                val scale by animateFloatAsState(
                    targetValue = if (isPressed) 0.95f else 1f,
                    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
                    label = "avatar_scale"
                )
                
                Card(
                    modifier = Modifier
                        .size(120.dp)
                        .scale(scale),
                    shape = CircleShape,
                    border = BorderStroke(
                        4.dp,
                        MaterialTheme.colorScheme.primary
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    if (user?.avatarUrl != null) {
                        AsyncImage(
                            model = user.avatarUrl,
                            contentDescription = null,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(
                                    Brush.linearGradient(
                                        listOf(
                                            MaterialTheme.colorScheme.primary,
                                            MaterialTheme.colorScheme.secondary
                                        )
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = (user?.displayName?.firstOrNull() ?: "U").toString().uppercase(),
                                style = MaterialTheme.typography.headlineLarge,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // User Info
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = user?.displayName ?: "Unknown User",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                    
                    if (user?.isVerified == true) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            imageVector = Icons.Default.Verified,
                            contentDescription = "Verified",
                            modifier = Modifier.size(24.dp),
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                }
                
                user?.username?.let {
                    Text(
                        text = "@$it",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
                    )
                }
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Bio
                user?.bio?.let { bio ->
                    Text(
                        text = bio,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        textAlign = TextAlign.Center,
                        maxLines = 3,
                        overflow = TextOverflow.Ellipsis
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                }
                
                // Stats Row
                Row(
                    horizontalArrangement = Arrangement.spacedBy(24.dp)
                ) {
                    ProfileStat(
                        count = user?.postsCount ?: 0,
                        label = "Posts",
                        onClick = { /* TODO */ }
                    )
                    ProfileStat(
                        count = user?.followersCount ?: 0,
                        label = "Followers",
                        onClick = onFollowersClick
                    )
                    ProfileStat(
                        count = user?.followingCount ?: 0,
                        label = "Following",
                        onClick = onFollowingClick
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Action Buttons
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    if (isOwnProfile) {
                        OutlinedButton(
                            onClick = onEditProfileClick,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                            ),
                            border = BorderStroke(
                                1.dp,
                                MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Edit Profile")
                        }
                    } else {
                        Button(
                            onClick = onFollowClick,
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isFollowing) {
                                    MaterialTheme.colorScheme.surface
                                } else {
                                    MaterialTheme.colorScheme.primary
                                },
                                contentColor = if (isFollowing) {
                                    MaterialTheme.colorScheme.onSurface
                                } else {
                                    MaterialTheme.colorScheme.onPrimary
                                }
                            )
                        ) {
                            AnimatedContent(
                                targetState = isFollowing,
                                transitionSpec = {
                                    fadeIn() togetherWith fadeOut()
                                },
                                label = "follow_button"
                            ) { following ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = if (following) Icons.Default.PersonRemove else Icons.Default.PersonAdd,
                                        contentDescription = null,
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(if (following) "Unfollow" else "Follow")
                                }
                            }
                        }
                        
                        OutlinedButton(
                            onClick = onMessageClick,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                            ),
                            border = BorderStroke(
                                1.dp,
                                MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Message,
                                contentDescription = "Message",
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProfileStat(
    count: Int,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier.clickable { onClick() }
    ) {
        Text(
            text = formatCount(count),
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onPrimaryContainer
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
        )
    }
}

private fun formatCount(count: Int): String {
    return when {
        count >= 1_000_000 -> "${count / 1_000_000}M"
        count >= 1_000 -> "${count / 1_000}K"
        else -> count.toString()
    }
}