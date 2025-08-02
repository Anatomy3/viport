package com.viport.ui.feed.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.viport.domain.model.MediaItem
import com.viport.domain.model.MediaType
import com.viport.domain.model.Post
import kotlin.math.absoluteValue

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun PostCard(
    post: Post,
    onPostClick: () -> Unit,
    onProfileClick: () -> Unit,
    onLikeClick: () -> Unit,
    onCommentClick: () -> Unit,
    onShareClick: () -> Unit,
    onBookmarkClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isLiked by remember { mutableStateOf(post.isLiked) }
    var isBookmarked by remember { mutableStateOf(post.isBookmarked) }
    var likesCount by remember { mutableIntStateOf(post.likesCount) }
    
    // Update local state when post changes
    LaunchedEffect(post.isLiked) {
        isLiked = post.isLiked
    }
    
    LaunchedEffect(post.isBookmarked) {
        isBookmarked = post.isBookmarked
    }
    
    LaunchedEffect(post.likesCount) {
        likesCount = post.likesCount
    }
    
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onPostClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column {
            // Post Header
            PostHeader(
                user = post.user,
                createdAt = post.createdAt,
                location = post.location,
                onProfileClick = onProfileClick,
                onMenuClick = { /* TODO: Show post menu */ }
            )
            
            // Post Content
            if (post.content.isNotBlank()) {
                PostContent(
                    content = post.content,
                    tags = post.tags,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }
            
            // Media Content
            if (post.mediaItems.isNotEmpty()) {
                PostMedia(
                    mediaItems = post.mediaItems,
                    modifier = Modifier.padding(top = if (post.content.isNotBlank()) 12.dp else 0.dp)
                )
            }
            
            // Post Actions
            PostActions(
                isLiked = isLiked,
                isBookmarked = isBookmarked,
                likesCount = likesCount,
                commentsCount = post.commentsCount,
                sharesCount = post.sharesCount,
                onLikeClick = {
                    isLiked = !isLiked
                    likesCount += if (isLiked) 1 else -1
                    onLikeClick()
                },
                onCommentClick = onCommentClick,
                onShareClick = onShareClick,
                onBookmarkClick = {
                    isBookmarked = !isBookmarked
                    onBookmarkClick()
                },
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
private fun PostHeader(
    user: com.viport.domain.model.User?,
    createdAt: String,
    location: String?,
    onProfileClick: () -> Unit,
    onMenuClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // User Avatar
        Card(
            modifier = Modifier
                .size(44.dp)
                .clickable { onProfileClick() },
            shape = CircleShape,
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        // User Info
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = user?.displayName ?: "Unknown User",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                if (user?.isVerified == true) {
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        imageVector = Icons.Default.Verified,
                        contentDescription = "Verified",
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = formatTimeAgo(createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                location?.let {
                    Text(
                        text = " • ",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = null,
                        modifier = Modifier.size(12.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(
                        text = it,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }
        
        // Menu Button
        IconButton(onClick = onMenuClick) {
            Icon(
                imageVector = Icons.Default.MoreVert,
                contentDescription = "More options",
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun PostContent(
    content: String,
    tags: List<String>,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        // Main content
        var isExpanded by remember { mutableStateOf(false) }
        val maxLines = if (isExpanded) Int.MAX_VALUE else 3
        
        Text(
            text = content,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurface,
            maxLines = maxLines,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.animateContentSize()
        )
        
        // Show more/less button for long content
        if (content.length > 150) {
            TextButton(
                onClick = { isExpanded = !isExpanded },
                contentPadding = PaddingValues(0.dp)
            ) {
                Text(
                    text = if (isExpanded) "Show less" else "Show more",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.Medium
                )
            }
        }
        
        // Tags
        if (tags.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(tags.size) { index ->
                    AssistChip(
                        onClick = { /* TODO: Navigate to tag */ },
                        label = {
                            Text(
                                text = "#${tags[index]}",
                                style = MaterialTheme.typography.labelSmall
                            )
                        },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.primaryContainer,
                            labelColor = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    )
                }
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun PostMedia(
    mediaItems: List<MediaItem>,
    modifier: Modifier = Modifier
) {
    if (mediaItems.isEmpty()) return
    
    Box(modifier = modifier) {
        if (mediaItems.size == 1) {
            // Single media item
            SingleMediaItem(
                mediaItem = mediaItems.first(),
                modifier = Modifier.fillMaxWidth()
            )
        } else {
            // Multiple media items with pager
            val pagerState = rememberPagerState(pageCount = { mediaItems.size })
            
            Column {
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxWidth()
                ) { page ->
                    SingleMediaItem(
                        mediaItem = mediaItems[page],
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                // Page indicator
                if (mediaItems.size > 1) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.Center
                    ) {
                        repeat(mediaItems.size) { index ->
                            val isSelected = index == pagerState.currentPage
                            Box(
                                modifier = Modifier
                                    .size(if (isSelected) 8.dp else 6.dp)
                                    .clip(CircleShape)
                                    .background(
                                        if (isSelected) {
                                            MaterialTheme.colorScheme.primary
                                        } else {
                                            MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.4f)
                                        }
                                    )
                                    .animateContentSize()
                            )
                            if (index < mediaItems.size - 1) {
                                Spacer(modifier = Modifier.width(4.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SingleMediaItem(
    mediaItem: MediaItem,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.aspectRatio(1f),
        shape = RoundedCornerShape(0.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            when (mediaItem.type) {
                MediaType.IMAGE -> {
                    AsyncImage(
                        model = mediaItem.url,
                        contentDescription = mediaItem.altText,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }
                MediaType.VIDEO -> {
                    // Video thumbnail with play button
                    AsyncImage(
                        model = mediaItem.thumbnailUrl ?: mediaItem.url,
                        contentDescription = mediaItem.altText,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                    
                    // Play button overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Card(
                            modifier = Modifier.size(56.dp),
                            shape = CircleShape,
                            colors = CardDefaults.cardColors(
                                containerColor = Color.Black.copy(alpha = 0.7f)
                            )
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.PlayArrow,
                                    contentDescription = "Play video",
                                    tint = Color.White,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                    }
                    
                    // Duration badge
                    mediaItem.duration?.let { duration ->
                        Card(
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = Color.Black.copy(alpha = 0.7f)
                            ),
                            shape = RoundedCornerShape(4.dp)
                        ) {
                            Text(
                                text = formatDuration(duration),
                                style = MaterialTheme.typography.labelSmall,
                                color = Color.White,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
                else -> {
                    // Placeholder for other media types
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Description,
                            contentDescription = "Media file",
                            modifier = Modifier.size(48.dp),
                            tint = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun PostActions(
    isLiked: Boolean,
    isBookmarked: Boolean,
    likesCount: Int,
    commentsCount: Int,
    sharesCount: Int,
    onLikeClick: () -> Unit,
    onCommentClick: () -> Unit,
    onShareClick: () -> Unit,
    onBookmarkClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        // Action buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row {
                // Like button with animation
                AnimatedActionButton(
                    icon = if (isLiked) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                    contentDescription = "Like",
                    isActive = isLiked,
                    activeColor = Color.Red,
                    onClick = onLikeClick
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // Comment button
                ActionButton(
                    icon = Icons.Outlined.ChatBubbleOutline,
                    contentDescription = "Comment",
                    onClick = onCommentClick
                )
                
                Spacer(modifier = Modifier.width(16.dp))
                
                // Share button
                ActionButton(
                    icon = Icons.Outlined.Share,
                    contentDescription = "Share",
                    onClick = onShareClick
                )
            }
            
            // Bookmark button
            AnimatedActionButton(
                icon = if (isBookmarked) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                contentDescription = "Bookmark",
                isActive = isBookmarked,
                activeColor = MaterialTheme.colorScheme.primary,
                onClick = onBookmarkClick
            )
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Engagement stats
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (likesCount > 0) {
                Text(
                    text = "$likesCount ${if (likesCount == 1) "like" else "likes"}",
                    style = MaterialTheme.typography.bodySmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
            
            if (commentsCount > 0) {
                if (likesCount > 0) {
                    Text(
                        text = " • ",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = "$commentsCount ${if (commentsCount == 1) "comment" else "comments"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (sharesCount > 0) {
                if (likesCount > 0 || commentsCount > 0) {
                    Text(
                        text = " • ",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = "$sharesCount ${if (sharesCount == 1) "share" else "shares"}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
private fun ActionButton(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    IconButton(
        onClick = onClick,
        modifier = modifier.size(40.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
private fun AnimatedActionButton(
    icon: ImageVector,
    contentDescription: String,
    isActive: Boolean,
    activeColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val scale by animateFloatAsState(
        targetValue = if (isActive) 1.2f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "button_scale"
    )
    
    IconButton(
        onClick = onClick,
        modifier = modifier.size(40.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            modifier = Modifier
                .size(24.dp)
                .scale(scale),
            tint = if (isActive) activeColor else MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// Helper functions
private fun formatTimeAgo(timestamp: String): String {
    // TODO: Implement proper time ago formatting
    return "2h ago"
}

private fun formatDuration(seconds: Int): String {
    val minutes = seconds / 60
    val remainingSeconds = seconds % 60
    return String.format("%d:%02d", minutes, remainingSeconds)
}