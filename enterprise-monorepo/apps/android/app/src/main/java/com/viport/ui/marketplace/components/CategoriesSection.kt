package com.viport.ui.marketplace.components

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.viport.domain.model.ProductCategory

@Composable
fun CategoriesSection(
    categories: List<ProductCategory>,
    selectedCategory: ProductCategory?,
    onCategorySelected: (ProductCategory?) -> Unit,
    onViewAllClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        // Section Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Categories",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            
            TextButton(onClick = onViewAllClick) {
                Text("View All")
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Categories List
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            contentPadding = PaddingValues(horizontal = 4.dp)
        ) {
            // All categories item
            item {
                CategoryItem(
                    category = null,
                    isSelected = selectedCategory == null,
                    onClick = { onCategorySelected(null) }
                )
            }
            
            items(categories) { category ->
                CategoryItem(
                    category = category,
                    isSelected = selectedCategory == category,
                    onClick = { onCategorySelected(category) }
                )
            }
        }
    }
}

@Composable
private fun CategoryItem(
    category: ProductCategory?,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val animationSpec = remember {
        spring<Float>(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        )
    }
    
    val backgroundColor by animateColorAsState(
        targetValue = if (isSelected) {
            MaterialTheme.colorScheme.primary
        } else {
            MaterialTheme.colorScheme.surfaceVariant
        },
        animationSpec = tween(300),
        label = "category_background"
    )
    
    val contentColor by animateColorAsState(
        targetValue = if (isSelected) {
            MaterialTheme.colorScheme.onPrimary
        } else {
            MaterialTheme.colorScheme.onSurfaceVariant
        },
        animationSpec = tween(300),
        label = "category_content"
    )
    
    val scale by animateFloatAsState(
        targetValue = if (isSelected) 1.05f else 1f,
        animationSpec = animationSpec,
        label = "category_scale"
    )
    
    var isPressed by remember { mutableStateOf(false) }
    val pressScale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy),
        label = "category_press"
    )
    
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .scale(scale * pressScale)
            .clickable(
                interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                indication = null
            ) {
                isPressed = true
                onClick()
            }
    ) {
        // Category Icon
        Card(
            modifier = Modifier.size(64.dp),
            shape = CircleShape,
            colors = CardDefaults.cardColors(
                containerColor = backgroundColor
            ),
            elevation = CardDefaults.cardElevation(
                defaultElevation = if (isSelected) 8.dp else 4.dp
            )
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (category == null) {
                    // All categories icon
                    Icon(
                        imageVector = Icons.Default.GridView,
                        contentDescription = "All",
                        tint = contentColor,
                        modifier = Modifier.size(28.dp)
                    )
                } else {
                    // Category specific icon
                    Icon(
                        imageVector = getCategoryIcon(category),
                        contentDescription = category.name,
                        tint = contentColor,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        // Category Name
        Text(
            text = category?.name ?: "All",
            style = MaterialTheme.typography.bodySmall,
            fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Normal,
            color = if (isSelected) {
                MaterialTheme.colorScheme.primary
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            },
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.widthIn(max = 80.dp)
        )
        
        // Selection indicator
        AnimatedVisibility(
            visible = isSelected,
            enter = fadeIn(animationSpec = tween(300)) + scaleIn(animationSpec = animationSpec),
            exit = fadeOut(animationSpec = tween(200)) + scaleOut(animationSpec = animationSpec)
        ) {
            Box(
                modifier = Modifier
                    .padding(top = 4.dp)
                    .size(4.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.primary)
            )
        }
    }
    
    // Reset press state
    LaunchedEffect(isPressed) {
        if (isPressed) {
            kotlinx.coroutines.delay(150)
            isPressed = false
        }
    }
}

private fun getCategoryIcon(category: ProductCategory): ImageVector {
    return when (category.name.lowercase()) {
        "electronics" -> Icons.Default.Devices
        "fashion" -> Icons.Default.Style
        "home & garden" -> Icons.Default.Home
        "sports" -> Icons.Default.SportsTennis
        "books" -> Icons.Default.MenuBook
        "toys" -> Icons.Default.Toys
        "beauty" -> Icons.Default.Spa
        "automotive" -> Icons.Default.DirectionsCar
        "food" -> Icons.Default.Restaurant
        "health" -> Icons.Default.HealthAndSafety
        "music" -> Icons.Default.MusicNote
        "games" -> Icons.Default.SportsEsports
        "travel" -> Icons.Default.Flight
        "pets" -> Icons.Default.Pets
        "office" -> Icons.Default.Business
        "jewelry" -> Icons.Default.Diamond
        "art" -> Icons.Default.Palette
        "photography" -> Icons.Default.CameraAlt
        else -> Icons.Default.Category
    }
}