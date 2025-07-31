import type { Meta, StoryObj } from '@storybook/react'
import { 
  LoadingSpinner, 
  LoadingSkeleton, 
  LoadingCard, 
  PostLoadingSkeleton,
  PortfolioLoadingSkeleton,
  GridLoadingSkeleton,
  FullPageLoading,
  LoadingButton 
} from './loading'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'UI/Loading',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading components for different use cases and states.',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta

// Loading Spinner Stories
export const Spinner: StoryObj<typeof LoadingSpinner> = {
  render: () => (
    <div className="flex gap-8 items-center">
      <div className="text-center">
        <LoadingSpinner size="sm" />
        <p className="mt-2 text-sm text-gray-600">Small</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="mt-2 text-sm text-gray-600">Medium</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-gray-600">Large</p>
      </div>
    </div>
  ),
}

export const SpinnerWithText: StoryObj<typeof LoadingSpinner> = {
  render: () => (
    <div className="space-y-4">
      <LoadingSpinner text="Loading..." />
      <LoadingSpinner size="lg" text="Please wait..." />
    </div>
  ),
}

// Loading Skeleton Stories
export const Skeleton: StoryObj<typeof LoadingSkeleton> = {
  render: () => (
    <div className="space-y-8 w-96">
      <div>
        <h3 className="mb-4 font-semibold">Default Skeleton</h3>
        <LoadingSkeleton lines={3} />
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Text Variant</h3>
        <LoadingSkeleton variant="text" lines={4} />
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Avatar Variant</h3>
        <LoadingSkeleton variant="avatar" />
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Image Variant</h3>
        <LoadingSkeleton variant="image" />
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Card Variant</h3>
        <LoadingSkeleton variant="card" />
      </div>
    </div>
  ),
}

// Loading Card Stories
export const Card: StoryObj<typeof LoadingCard> = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
      <LoadingCard />
      <LoadingCard showImage={false} />
      <LoadingCard showAvatar={false} />
    </div>
  ),
}

// Specialized Loading Components
export const PostSkeleton: StoryObj<typeof PostLoadingSkeleton> = {
  render: () => (
    <div className="max-w-2xl space-y-4">
      <PostLoadingSkeleton />
      <PostLoadingSkeleton />
    </div>
  ),
}

export const PortfolioSkeleton: StoryObj<typeof PortfolioLoadingSkeleton> = {
  render: () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl">
      <PortfolioLoadingSkeleton />
      <PortfolioLoadingSkeleton />
      <PortfolioLoadingSkeleton />
    </div>
  ),
}

// Grid Loading Stories
export const GridLoading: StoryObj<typeof GridLoadingSkeleton> = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-semibold">Post Grid (3 columns)</h3>
        <GridLoadingSkeleton variant="post" columns={3} count={6} />
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Portfolio Grid (4 columns)</h3>
        <GridLoadingSkeleton variant="portfolio" columns={4} count={8} />
      </div>
      
      <div>
        <h3 className="mb-4 font-semibold">Card Grid (2 columns)</h3>
        <GridLoadingSkeleton variant="card" columns={2} count={4} />
      </div>
    </div>
  ),
}

// Full Page Loading
export const FullPage: StoryObj<typeof FullPageLoading> = {
  render: () => (
    <div style={{ height: '400px', position: 'relative' }}>
      <FullPageLoading text="Loading application..." />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
}

// Loading Button Stories
export const ButtonLoading: StoryObj<typeof LoadingButton> = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <LoadingButton loading={false}>Normal Button</LoadingButton>
        <LoadingButton loading={true}>Loading Button</LoadingButton>
        <LoadingButton loading={true} disabled>
          Disabled Loading
        </LoadingButton>
      </div>
      
      <div className="flex gap-4 items-center">
        <LoadingButton loading={false} size="sm">Small</LoadingButton>
        <LoadingButton loading={true} size="sm">Loading</LoadingButton>
        <LoadingButton loading={false} size="lg">Large</LoadingButton>
        <LoadingButton loading={true} size="lg">Loading</LoadingButton>
      </div>
    </div>
  ),
}

// Interactive Demo
export const InteractiveDemo: StoryObj = {
  render: () => {
    const [loading, setLoading] = useState(false)
    
    const handleClick = () => {
      setLoading(true)
      setTimeout(() => setLoading(false), 2000)
    }
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <LoadingButton
            loading={loading}
            onClick={handleClick}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Start Loading'}
          </LoadingButton>
        </div>
        
        {loading && (
          <div className="space-y-4">
            <LoadingSkeleton lines={3} />
            <div className="grid gap-4 md:grid-cols-2">
              <LoadingCard />
              <LoadingCard />
            </div>
          </div>
        )}
      </div>
    )
  },
}

// Import useState for interactive demo
import { useState } from 'react'