'use client'

import { useState } from 'react'
import { Search, Filter, SlidersHorizontal } from 'lucide-react'

import { Button, Input } from '@viport/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@viport/ui'

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'oldest', label: 'Oldest First' },
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'photography', label: 'Photography' },
  { value: 'digitalart', label: 'Digital Art' },
  { value: 'design', label: 'Design' },
  { value: 'painting', label: 'Painting' },
  { value: 'sculpture', label: 'Sculpture' },
  { value: 'street', label: 'Street Art' },
  { value: 'nature', label: 'Nature' },
  { value: 'portrait', label: 'Portrait' },
]

export function PostsFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all'])
  const [showFilters, setShowFilters] = useState(false)

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (category === 'all') {
      setSelectedCategories(checked ? ['all'] : [])
    } else {
      const newCategories = checked
        ? [...selectedCategories.filter(c => c !== 'all'), category]
        : selectedCategories.filter(c => c !== category)
      
      setSelectedCategories(newCategories.length === 0 ? ['all'] : newCategories)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSortBy('recent')
    setSelectedCategories(['all'])
  }

  const activeFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (sortBy !== 'recent') count++
    if (!selectedCategories.includes('all')) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFiltersCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {activeFiltersCount()}
            </span>
          )}
        </Button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filter Posts</h3>
            {activeFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {sortOptions.find(option => option.value === sortBy)?.label}
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={sortBy === option.value ? 'bg-accent' : ''}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Categories</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCategories.includes('all') 
                      ? 'All Categories'
                      : selectedCategories.length === 1
                      ? categoryOptions.find(c => c.value === selectedCategories[0])?.label
                      : `${selectedCategories.length} categories`
                    }
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuLabel>Categories</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {categoryOptions.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.value}
                      checked={selectedCategories.includes(category.value)}
                      onCheckedChange={(checked) => 
                        handleCategoryChange(category.value, checked)
                      }
                    >
                      {category.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount() > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Filters:</p>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {sortBy !== 'recent' && (
                  <div className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    Sort: {sortOptions.find(o => o.value === sortBy)?.label}
                    <button
                      onClick={() => setSortBy('recent')}
                      className="hover:bg-secondary-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                {!selectedCategories.includes('all') && (
                  <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    Categories: {selectedCategories.length}
                    <button
                      onClick={() => setSelectedCategories(['all'])}
                      className="hover:bg-accent-foreground/20 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Filter Tags */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Quick filters:</span>
        {['photography', 'digitalart', 'design', 'trending'].map((tag) => (
          <Button
            key={tag}
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => {
              if (selectedCategories.includes(tag)) {
                handleCategoryChange(tag, false)
              } else {
                handleCategoryChange(tag, true)
              }
            }}
          >
            #{tag}
          </Button>
        ))}
      </div>
    </div>
  )
}