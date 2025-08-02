package com.viport.ui.components.common

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ErrorCard(
    error: String?,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null,
    type: ErrorType = ErrorType.ERROR
) {
    // Animation for error icon rotation
    val iconRotation by animateFloatAsState(
        targetValue = if (error != null) 360f else 0f,
        animationSpec = tween(durationMillis = 500),
        label = "icon_rotation"
    )
    
    AnimatedVisibility(
        visible = error != null,
        enter = expandVertically(
            animationSpec = tween(300)
        ) + fadeIn(animationSpec = tween(300)),
        exit = shrinkVertically(
            animationSpec = tween(300)
        ) + fadeOut(animationSpec = tween(300))
    ) {
        error?.let { errorMessage ->
            Card(
                modifier = modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = when (type) {
                        ErrorType.ERROR -> MaterialTheme.colorScheme.errorContainer
                        ErrorType.WARNING -> MaterialTheme.colorScheme.secondaryContainer
                        ErrorType.INFO -> MaterialTheme.colorScheme.primaryContainer
                    }
                ),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Error icon with rotation animation
                    Icon(
                        imageVector = when (type) {
                            ErrorType.ERROR -> Icons.Default.Error
                            ErrorType.WARNING -> Icons.Default.Warning
                            ErrorType.INFO -> Icons.Default.Error // You can change this to info icon
                        },
                        contentDescription = null,
                        tint = when (type) {
                            ErrorType.ERROR -> MaterialTheme.colorScheme.onErrorContainer
                            ErrorType.WARNING -> MaterialTheme.colorScheme.onSecondaryContainer
                            ErrorType.INFO -> MaterialTheme.colorScheme.onPrimaryContainer
                        },
                        modifier = Modifier
                            .size(24.dp)
                            .rotate(iconRotation)
                    )
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    // Error message
                    Text(
                        text = errorMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = when (type) {
                            ErrorType.ERROR -> MaterialTheme.colorScheme.onErrorContainer
                            ErrorType.WARNING -> MaterialTheme.colorScheme.onSecondaryContainer
                            ErrorType.INFO -> MaterialTheme.colorScheme.onPrimaryContainer
                        },
                        modifier = Modifier.weight(1f)
                    )
                    
                    // Dismiss button
                    onDismiss?.let {
                        IconButton(
                            onClick = it,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Dismiss",
                                tint = when (type) {
                                    ErrorType.ERROR -> MaterialTheme.colorScheme.onErrorContainer
                                    ErrorType.WARNING -> MaterialTheme.colorScheme.onSecondaryContainer
                                    ErrorType.INFO -> MaterialTheme.colorScheme.onPrimaryContainer
                                },
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

enum class ErrorType {
    ERROR,
    WARNING,
    INFO
}

@Composable
fun SuccessCard(
    message: String?,
    modifier: Modifier = Modifier,
    onDismiss: (() -> Unit)? = null
) {
    AnimatedVisibility(
        visible = message != null,
        enter = expandVertically(
            animationSpec = tween(300)
        ) + fadeIn(animationSpec = tween(300)),
        exit = shrinkVertically(
            animationSpec = tween(300)
        ) + fadeOut(animationSpec = tween(300))
    ) {
        message?.let { successMessage ->
            Card(
                modifier = modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                ),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Warning, // Replace with check circle icon
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.size(24.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Text(
                        text = successMessage,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onPrimaryContainer,
                        modifier = Modifier.weight(1f)
                    )
                    
                    onDismiss?.let {
                        IconButton(
                            onClick = it,
                            modifier = Modifier.size(24.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Dismiss",
                                tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}