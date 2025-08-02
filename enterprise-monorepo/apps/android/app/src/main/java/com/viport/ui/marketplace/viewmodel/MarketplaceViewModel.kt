package com.viport.ui.marketplace.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.paging.*
import com.viport.domain.model.Product
import com.viport.domain.model.ProductCategory
import com.viport.domain.repository.ProductRepository
import com.viport.domain.repository.CartRepository
import com.viport.domain.usecase.AddToCartUseCase
import com.viport.domain.usecase.GetFeaturedProductsUseCase
import com.viport.domain.usecase.GetProductCategoriesUseCase
import com.viport.domain.usecase.GetProductsUseCase
import com.viport.domain.usecase.ToggleProductFavoriteUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MarketplaceUiState(
    val categories: List<ProductCategory> = emptyList(),
    val selectedCategory: ProductCategory? = null,
    val searchQuery: String = "",
    val cartItemsCount: Int = 0,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class MarketplaceViewModel @Inject constructor(
    private val getProductsUseCase: GetProductsUseCase,
    private val getFeaturedProductsUseCase: GetFeaturedProductsUseCase,
    private val getProductCategoriesUseCase: GetProductCategoriesUseCase,
    private val addToCartUseCase: AddToCartUseCase,
    private val toggleProductFavoriteUseCase: ToggleProductFavoriteUseCase,
    private val productRepository: ProductRepository,
    private val cartRepository: CartRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(MarketplaceUiState())
    val uiState: StateFlow<MarketplaceUiState> = _uiState.asStateFlow()
    
    // Featured products paging flow
    val featuredProducts: Flow<PagingData<Product>> = Pager(
        config = PagingConfig(
            pageSize = 10,
            enablePlaceholders = false,
            prefetchDistance = 3
        ),
        pagingSourceFactory = {
            FeaturedProductsPagingSource(productRepository)
        }
    ).flow.cachedIn(viewModelScope)
    
    // Regular products paging flow with category filter
    val recentProducts: Flow<PagingData<Product>> = _uiState
        .map { it.selectedCategory }
        .distinctUntilChanged()
        .flatMapLatest { selectedCategory ->
            Pager(
                config = PagingConfig(
                    pageSize = 20,
                    enablePlaceholders = false,
                    prefetchDistance = 5
                ),
                pagingSourceFactory = {
                    ProductsPagingSource(
                        productRepository = productRepository,
                        categoryId = selectedCategory?.id,
                        searchQuery = null // Search will be handled separately
                    )
                }
            ).flow
        }
        .cachedIn(viewModelScope)
    
    init {
        loadInitialData()
        observeCartItems()
    }
    
    private fun loadInitialData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            
            try {
                // Load categories
                val categories = getProductCategoriesUseCase()
                
                _uiState.update {
                    it.copy(
                        categories = categories,
                        isLoading = false,
                        error = null
                    )
                }
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "Failed to load marketplace data"
                    )
                }
            }
        }
    }
    
    private fun observeCartItems() {
        viewModelScope.launch {
            cartRepository.getCartItemsCount()
                .catch { e ->
                    // Handle error silently for cart count
                }
                .collect { count ->
                    _uiState.update { it.copy(cartItemsCount = count) }
                }
        }
    }
    
    fun selectCategory(category: ProductCategory?) {
        _uiState.update { it.copy(selectedCategory = category) }
    }
    
    fun clearCategoryFilter() {
        _uiState.update { it.copy(selectedCategory = null) }
    }
    
    fun updateSearchQuery(query: String) {
        _uiState.update { it.copy(searchQuery = query) }
    }
    
    fun toggleFavorite(productId: String) {
        viewModelScope.launch {
            try {
                toggleProductFavoriteUseCase(productId)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(error = e.message ?: "Failed to update favorite")
                }
            }
        }
    }
    
    fun addToCart(productId: String) {
        viewModelScope.launch {
            try {
                addToCartUseCase(productId, quantity = 1)
                // Show success feedback (could be a snackbar)
            } catch (e: Exception) {
                _uiState.update {
                    it.copy(error = e.message ?: "Failed to add to cart")
                }
            }
        }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
    
    fun refresh() {
        loadInitialData()
    }
}

class FeaturedProductsPagingSource(
    private val productRepository: ProductRepository
) : PagingSource<Int, Product>() {
    
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Product> {
        return try {
            val page = params.key ?: 0
            val pageSize = params.loadSize
            
            val products = productRepository.getFeaturedProducts(
                page = page,
                pageSize = pageSize
            )
            
            LoadResult.Page(
                data = products,
                prevKey = if (page == 0) null else page - 1,
                nextKey = if (products.isEmpty() || products.size < pageSize) null else page + 1
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
    
    override fun getRefreshKey(state: PagingState<Int, Product>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }
}

class ProductsPagingSource(
    private val productRepository: ProductRepository,
    private val categoryId: String? = null,
    private val searchQuery: String? = null
) : PagingSource<Int, Product>() {
    
    override suspend fun load(params: LoadParams<Int>): LoadResult<Int, Product> {
        return try {
            val page = params.key ?: 0
            val pageSize = params.loadSize
            
            val products = when {
                !searchQuery.isNullOrEmpty() -> {
                    productRepository.searchProducts(
                        query = searchQuery,
                        categoryId = categoryId,
                        page = page,
                        pageSize = pageSize
                    )
                }
                categoryId != null -> {
                    productRepository.getProductsByCategory(
                        categoryId = categoryId,
                        page = page,
                        pageSize = pageSize
                    )
                }
                else -> {
                    productRepository.getProducts(
                        page = page,
                        pageSize = pageSize
                    )
                }
            }
            
            LoadResult.Page(
                data = products,
                prevKey = if (page == 0) null else page - 1,
                nextKey = if (products.isEmpty() || products.size < pageSize) null else page + 1
            )
        } catch (e: Exception) {
            LoadResult.Error(e)
        }
    }
    
    override fun getRefreshKey(state: PagingState<Int, Product>): Int? {
        return state.anchorPosition?.let { anchorPosition ->
            state.closestPageToPosition(anchorPosition)?.prevKey?.plus(1)
                ?: state.closestPageToPosition(anchorPosition)?.nextKey?.minus(1)
        }
    }
}