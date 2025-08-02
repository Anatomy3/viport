package com.viport.ui.marketplace

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.foundation.shape.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.paging.LoadState
import androidx.paging.compose.LazyPagingItems
import androidx.paging.compose.collectAsLazyPagingItems
import coil.compose.AsyncImage
import com.viport.domain.model.Product
import com.viport.domain.model.ProductCategory
import com.viport.ui.components.common.ErrorCard
import com.viport.ui.components.common.LoadingCard
import com.viport.ui.marketplace.components.*
import com.viport.ui.marketplace.viewmodel.MarketplaceViewModel

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MarketplaceScreen(
    onProductClick: (String) -> Unit,
    onCategoriesClick: () -> Unit,
    onCartClick: () -> Unit,
    onSearchClick: () -> Unit,
    onCreateProductClick: () -> Unit,
    viewModel: MarketplaceViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val featuredProducts = viewModel.featuredProducts.collectAsLazyPagingItems()
    val recentProducts = viewModel.recentProducts.collectAsLazyPagingItems()
    val lazyListState = rememberLazyListState()
    val keyboardController = LocalSoftwareKeyboardController.current
    
    // FAB visibility based on scroll
    val fabVisible by remember {
        derivedStateOf {
            lazyListState.firstVisibleItemIndex < 2
        }
    }
    
    Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            state = lazyListState,
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 88.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header with search and cart
            item {
                MarketplaceHeader(
                    searchQuery = uiState.searchQuery,
                    onSearchQueryChange = viewModel::updateSearchQuery,
                    onSearchClick = {
                        keyboardController?.hide()
                        onSearchClick()
                    },
                    onCartClick = onCartClick,
                    cartItemsCount = uiState.cartItemsCount,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
            }
            
            // Categories section
            item {
                CategoriesSection(
                    categories = uiState.categories,
                    selectedCategory = uiState.selectedCategory,
                    onCategorySelected = viewModel::selectCategory,
                    onViewAllClick = onCategoriesClick,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }
            
            // Featured products section
            if (featuredProducts.itemCount > 0) {
                item {
                    Text(
                        text = "Featured Products",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
                
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp)
                    ) {
                        items(
                            count = minOf(featuredProducts.itemCount, 10),
                            key = { index -> featuredProducts[index]?.id ?: index }
                        ) { index ->
                            val product = featuredProducts[index]
                            if (product != null) {
                                FeaturedProductCard(
                                    product = product,
                                    onClick = { onProductClick(product.id) },
                                    onFavoriteClick = { viewModel.toggleFavorite(product.id) },
                                    onAddToCartClick = { viewModel.addToCart(product.id) },
                                    modifier = Modifier
                                        .animateItemPlacement()
                                        .width(280.dp)
                                )
                            }
                        }
                    }
                }
            }
            
            // Recent products section
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (uiState.selectedCategory != null) {
                            "${uiState.selectedCategory!!.name} Products"
                        } else {
                            "Recent Products"
                        },
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                    
                    if (uiState.selectedCategory != null) {
                        TextButton(
                            onClick = { viewModel.clearCategoryFilter() }
                        ) {
                            Text("Show All")
                        }
                    }
                }
            }
            
            // Products grid
            if (recentProducts.itemCount == 0) {
                item {
                    EmptyMarketplaceState(
                        selectedCategory = uiState.selectedCategory,
                        onCreateProductClick = onCreateProductClick,
                        modifier = Modifier.padding(32.dp)
                    )
                }
            } else {
                items(
                    count = recentProducts.itemCount,
                    key = { index -> recentProducts[index]?.id ?: index },
                    span = { GridItemSpan(1) }
                ) { index ->
                    val product = recentProducts[index]
                    if (product != null) {
                        ProductCard(
                            product = product,
                            onClick = { onProductClick(product.id) },
                            onFavoriteClick = { viewModel.toggleFavorite(product.id) },
                            onAddToCartClick = { viewModel.addToCart(product.id) },
                            modifier = Modifier
                                .animateItemPlacement()
                                .padding(horizontal = if (index % 2 == 0) 16.dp else 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
            
            // Loading state
            if (recentProducts.loadState.append is LoadState.Loading) {
                item {
                    LoadingCard(
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
            
            // Error state
            if (recentProducts.loadState.append is LoadState.Error) {
                item {
                    ErrorCard(
                        error = "Failed to load more products",
                        onDismiss = { recentProducts.retry() },
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
        
        // Floating Action Button for creating products
        AnimatedVisibility(
            visible = fabVisible,
            enter = slideInVertically(
                initialOffsetY = { it },
                animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy)
            ) + fadeIn(),
            exit = slideOutVertically(
                targetOffsetY = { it },
                animationSpec = tween(300)
            ) + fadeOut(),
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp)
        ) {
            FloatingActionButton(
                onClick = onCreateProductClick,
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                elevation = FloatingActionButtonDefaults.elevation(
                    defaultElevation = 8.dp,
                    pressedElevation = 12.dp
                )
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Create Product",
                    modifier = Modifier.size(24.dp)
                )
            }
        }
        
        // Error snackbar
        uiState.error?.let { error ->
            LaunchedEffect(error) {
                // Show snackbar or handle error
                kotlinx.coroutines.delay(3000)
                viewModel.clearError()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MarketplaceHeader(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit,
    onSearchClick: () -> Unit,
    onCartClick: () -> Unit,
    cartItemsCount: Int,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Title and cart
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Marketplace",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Discover amazing products",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                // Cart button with badge
                Box {
                    IconButton(
                        onClick = onCartClick,
                        modifier = Modifier.size(48.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingCart,
                            contentDescription = "Cart",
                            tint = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    
                    if (cartItemsCount > 0) {
                        Badge(
                            modifier = Modifier.align(Alignment.TopEnd),
                            containerColor = MaterialTheme.colorScheme.error,
                            contentColor = MaterialTheme.colorScheme.onError
                        ) {
                            Text(
                                text = if (cartItemsCount > 99) "99+" else cartItemsCount.toString(),
                                style = MaterialTheme.typography.labelSmall
                            )
                        }
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Search bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = onSearchQueryChange,
                placeholder = { Text("Search products...") },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                },
                trailingIcon = if (searchQuery.isNotEmpty()) {
                    {
                        IconButton(onClick = { onSearchQueryChange("") }) {
                            Icon(
                                imageVector = Icons.Default.Clear,
                                contentDescription = "Clear",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                } else null,
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                keyboardActions = KeyboardActions(
                    onSearch = { onSearchClick() }
                ),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
private fun EmptyMarketplaceState(
    selectedCategory: ProductCategory?,
    onCreateProductClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Empty state animation
        val infiniteTransition = rememberInfiniteTransition(label = "empty_marketplace")
        val animatedFloat by infiniteTransition.animateFloat(
            initialValue = 0.8f,
            targetValue = 1.2f,
            animationSpec = infiniteRepeatable(
                animation = tween(2000, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "empty_scale"
        )
        
        Card(
            modifier = Modifier
                .size(100.dp)
                .scale(animatedFloat),
            shape = CircleShape,
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.primaryContainer
            )
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Storefront,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onPrimaryContainer,
                    modifier = Modifier.size(40.dp)
                )
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text(
            text = if (selectedCategory != null) {
                "No ${selectedCategory.name.lowercase()} products"
            } else {
                "No products yet"
            },
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.SemiBold,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = if (selectedCategory != null) {
                "Try selecting a different category or check back later"
            } else {
                "Be the first to list a product and start selling!"
            },
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        Button(
            onClick = onCreateProductClick,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text("Create Product")
        }
    }
}