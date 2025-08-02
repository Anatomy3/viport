package com.viport.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

// Enhanced Material Design 3 shape system for Viport
val Shapes = Shapes(
    // Extra small components (chips, badges, small buttons)
    extraSmall = RoundedCornerShape(4.dp),
    
    // Small components (buttons, text fields, small cards)
    small = RoundedCornerShape(8.dp),
    
    // Medium components (cards, dialogs, sheets)
    medium = RoundedCornerShape(12.dp),
    
    // Large components (large cards, navigation drawers)
    large = RoundedCornerShape(16.dp),
    
    // Extra large components (bottom sheets, large modals)
    extraLarge = RoundedCornerShape(28.dp)
)

// Custom shape definitions for specific Viport components
object ViportShapes {
    // Button shapes
    val buttonSmall = RoundedCornerShape(8.dp)
    val buttonMedium = RoundedCornerShape(12.dp)
    val buttonLarge = RoundedCornerShape(16.dp)
    val buttonPill = RoundedCornerShape(50)
    
    // Card shapes
    val cardSmall = RoundedCornerShape(8.dp)
    val cardMedium = RoundedCornerShape(12.dp)
    val cardLarge = RoundedCornerShape(16.dp)
    val cardXLarge = RoundedCornerShape(20.dp)
    
    // Input shapes
    val textField = RoundedCornerShape(12.dp)
    val textFieldFocused = RoundedCornerShape(16.dp)
    val searchBar = RoundedCornerShape(24.dp)
    
    // Modal and sheet shapes
    val bottomSheet = RoundedCornerShape(
        topStart = 24.dp,
        topEnd = 24.dp,
        bottomStart = 0.dp,
        bottomEnd = 0.dp
    )
    val dialog = RoundedCornerShape(20.dp)
    val fullScreenDialog = RoundedCornerShape(0.dp)
    
    // Navigation shapes
    val navigationBar = RoundedCornerShape(0.dp)
    val navigationRail = RoundedCornerShape(0.dp)
    val navigationDrawer = RoundedCornerShape(
        topEnd = 16.dp,
        bottomEnd = 16.dp,
        topStart = 0.dp,
        bottomStart = 0.dp
    )
    
    // FAB shapes
    val fabSmall = RoundedCornerShape(12.dp)
    val fabMedium = RoundedCornerShape(16.dp)
    val fabLarge = RoundedCornerShape(20.dp)
    val fabExtended = RoundedCornerShape(16.dp)
    
    // Component-specific shapes
    val chip = RoundedCornerShape(8.dp)
    val chipSelected = RoundedCornerShape(16.dp)
    val badge = RoundedCornerShape(8.dp)
    val progressIndicator = RoundedCornerShape(4.dp)
    val divider = RoundedCornerShape(1.dp)
    
    // Media shapes
    val imageSmall = RoundedCornerShape(8.dp)
    val imageMedium = RoundedCornerShape(12.dp)
    val imageLarge = RoundedCornerShape(16.dp)
    val avatar = RoundedCornerShape(50)
    val avatarSmall = RoundedCornerShape(50)
    val avatarMedium = RoundedCornerShape(50)
    val avatarLarge = RoundedCornerShape(50)
    
    // List item shapes
    val listItem = RoundedCornerShape(0.dp)
    val listItemCard = RoundedCornerShape(8.dp)
    val listItemSelected = RoundedCornerShape(12.dp)
    
    // Post and content shapes
    val postCard = RoundedCornerShape(16.dp)
    val postMedia = RoundedCornerShape(12.dp)
    val storyCard = RoundedCornerShape(50)
    val commentBubble = RoundedCornerShape(
        topStart = 16.dp,
        topEnd = 16.dp,
        bottomEnd = 16.dp,
        bottomStart = 4.dp
    )
    val replyBubble = RoundedCornerShape(
        topStart = 16.dp,
        topEnd = 16.dp,
        bottomStart = 16.dp,
        bottomEnd = 4.dp
    )
    
    // Product and marketplace shapes
    val productCard = RoundedCornerShape(16.dp)
    val productImage = RoundedCornerShape(12.dp)
    val categoryCard = RoundedCornerShape(50)
    val priceTag = RoundedCornerShape(
        topStart = 0.dp,
        topEnd = 8.dp,
        bottomEnd = 8.dp,
        bottomStart = 0.dp
    )
    
    // Learning platform shapes
    val courseCard = RoundedCornerShape(16.dp)
    val lessonCard = RoundedCornerShape(12.dp)
    val quizCard = RoundedCornerShape(8.dp)
    val progressBar = RoundedCornerShape(50)
    
    // Chat shapes
    val chatBubbleOwn = RoundedCornerShape(
        topStart = 16.dp,
        topEnd = 16.dp,
        bottomStart = 16.dp,
        bottomEnd = 4.dp
    )
    val chatBubbleOther = RoundedCornerShape(
        topStart = 16.dp,
        topEnd = 16.dp,
        bottomEnd = 16.dp,
        bottomStart = 4.dp
    )
    val chatInput = RoundedCornerShape(24.dp)
    val attachmentPreview = RoundedCornerShape(8.dp)
}