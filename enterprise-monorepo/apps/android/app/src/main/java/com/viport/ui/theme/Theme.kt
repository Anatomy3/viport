package com.viport.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Custom brand colors for Viport
private val ViportPrimary = Color(0xFF6750A4)
private val ViportPrimaryVariant = Color(0xFF4F378B)
private val ViportSecondary = Color(0xFF625B71)
private val ViportSecondaryVariant = Color(0xFF4A4458)

// Light theme colors
private val LightColorScheme = lightColorScheme(
    primary = ViportPrimary,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE6DEFF),
    onPrimaryContainer = Color(0xFF21005D),
    secondary = ViportSecondary,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE8DEF8),
    onSecondaryContainer = Color(0xFF1E192B),
    tertiary = Color(0xFF7D5260),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFFFD8E4),
    onTertiaryContainer = Color(0xFF370B1E),
    error = Color(0xFFBA1A1A),
    onError = Color.White,
    errorContainer = Color(0xFFFFDAD6),
    onErrorContainer = Color(0xFF410002),
    background = Color(0xFFFFFBFE),
    onBackground = Color(0xFF1C1B1F),
    surface = Color(0xFFFFFBFE),
    onSurface = Color(0xFF1C1B1F),
    surfaceVariant = Color(0xFFE7E0EC),
    onSurfaceVariant = Color(0xFF49454F),
    outline = Color(0xFF79747E),
    outlineVariant = Color(0xFFCAC4D0),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFF313033),
    inverseOnSurface = Color(0xFFF4EFF4),
    inversePrimary = Color(0xFFCFBCFF),
    surfaceDim = Color(0xFFDDD8DD),
    surfaceBright = Color(0xFFFFFBFE),
    surfaceContainerLowest = Color(0xFFFFFFFF),
    surfaceContainerLow = Color(0xFFF7F2F7),
    surfaceContainer = Color(0xFFF1ECF1),
    surfaceContainerHigh = Color(0xFFECE6EB),
    surfaceContainerHighest = Color(0xFFE6E0E5)
)

// Dark theme colors
private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFCFBCFF),
    onPrimary = Color(0xFF381E72),
    primaryContainer = Color(0xFF4F378B),
    onPrimaryContainer = Color(0xFFE6DEFF),
    secondary = Color(0xFFCCC2DC),
    onSecondary = Color(0xFF332D41),
    secondaryContainer = Color(0xFF4A4458),
    onSecondaryContainer = Color(0xFFE8DEF8),
    tertiary = Color(0xFFEFB8C8),
    onTertiary = Color(0xFF492532),
    tertiaryContainer = Color(0xFF633B48),
    onTertiaryContainer = Color(0xFFFFD8E4),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005),
    errorContainer = Color(0xFF93000A),
    onErrorContainer = Color(0xFFFFDAD6),
    background = Color(0xFF121212),
    onBackground = Color(0xFFE6E1E5),
    surface = Color(0xFF121212),
    onSurface = Color(0xFFE6E1E5),
    surfaceVariant = Color(0xFF49454F),
    onSurfaceVariant = Color(0xFFCAC4D0),
    outline = Color(0xFF938F99),
    outlineVariant = Color(0xFF49454F),
    scrim = Color(0xFF000000),
    inverseSurface = Color(0xFFE6E1E5),
    inverseOnSurface = Color(0xFF313033),
    inversePrimary = Color(0xFF6750A4),
    surfaceDim = Color(0xFF121212),
    surfaceBright = Color(0xFF383838),
    surfaceContainerLowest = Color(0xFF0D0D0D),
    surfaceContainerLow = Color(0xFF1A1A1A),
    surfaceContainer = Color(0xFF1E1E1E),
    surfaceContainerHigh = Color(0xFF292929),
    surfaceContainerHighest = Color(0xFF333333)
)

@Composable
fun ViportTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Dynamic color is available on Android 12+
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }
    
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}

// Theme state management
@Stable
class ThemeState(
    initialDarkMode: Boolean = false,
    initialDynamicColor: Boolean = true
) {
    var isDarkMode by mutableStateOf(initialDarkMode)
        private set
    
    var isDynamicColorEnabled by mutableStateOf(initialDynamicColor)
        private set
    
    fun toggleDarkMode() {
        isDarkMode = !isDarkMode
    }
    
    fun setDarkMode(enabled: Boolean) {
        isDarkMode = enabled
    }
    
    fun toggleDynamicColor() {
        isDynamicColorEnabled = !isDynamicColorEnabled
    }
    
    fun setDynamicColor(enabled: Boolean) {
        isDynamicColorEnabled = enabled
    }
}

@Composable
fun rememberThemeState(
    initialDarkMode: Boolean = isSystemInDarkTheme(),
    initialDynamicColor: Boolean = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
): ThemeState {
    return remember {
        ThemeState(
            initialDarkMode = initialDarkMode,
            initialDynamicColor = initialDynamicColor
        )
    }
}

// LocalThemeState provides access to theme state throughout the app
val LocalThemeState = compositionLocalOf<ThemeState> {
    error("No ThemeState provided")
}

@Composable
fun ViportThemeProvider(
    themeState: ThemeState = rememberThemeState(),
    content: @Composable () -> Unit
) {
    CompositionLocalProvider(LocalThemeState provides themeState) {
        ViportTheme(
            darkTheme = themeState.isDarkMode,
            dynamicColor = themeState.isDynamicColorEnabled,
            content = content
        )
    }
}

// Extension functions for easier theme access
@Composable
fun isDarkMode(): Boolean = LocalThemeState.current.isDarkMode

@Composable
fun isDynamicColorEnabled(): Boolean = LocalThemeState.current.isDynamicColorEnabled

// Color utilities for custom components
object ViportColors {
    val Success = Color(0xFF4CAF50)
    val Warning = Color(0xFFFF9800)
    val Info = Color(0xFF2196F3)
    
    @Composable
    fun success(): Color = if (isDarkMode()) Color(0xFF81C784) else Success
    
    @Composable
    fun warning(): Color = if (isDarkMode()) Color(0xFFFFB74D) else Warning
    
    @Composable
    fun info(): Color = if (isDarkMode()) Color(0xFF64B5F6) else Info
    
    @Composable
    fun onSuccess(): Color = if (isDarkMode()) Color(0xFF1B5E20) else Color.White
    
    @Composable
    fun onWarning(): Color = if (isDarkMode()) Color(0xFFE65100) else Color.White
    
    @Composable
    fun onInfo(): Color = if (isDarkMode()) Color(0xFF0D47A1) else Color.White
}