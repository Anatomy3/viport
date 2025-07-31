import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Button } from './button'
import { Heart, Download, Plus, ArrowRight } from 'lucide-react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    asChild: {
      control: 'boolean',
      description: 'Change the default rendered element for the one passed as a child',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the button is clicked',
    },
  },
  args: {
    onClick: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic variants
export const Default: Story = {
  args: {
    children: 'Button',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

// Sizes
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const Icon: Story = {
  args: {
    size: 'icon',
    children: <Heart className="h-4 w-4" />,
  },
}

// With icons
export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Download className="mr-2 h-4 w-4" />
        Download
      </>
    ),
  },
}

export const WithTrailingIcon: Story = {
  args: {
    children: (
      <>
        Continue
        <ArrowRight className="ml-2 h-4 w-4" />
      </>
    ),
  },
}

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
        Loading...
      </>
    ),
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
}

// Interactive example
export const Interactive: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button onClick={() => alert('Primary clicked!')}>
            Primary Action
          </Button>
          <Button variant="outline" onClick={() => alert('Secondary clicked!')}>
            Secondary Action
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={() => alert('Delete clicked!')}>
            <Heart className="mr-2 h-4 w-4" />
            Delete Item
          </Button>
          <Button variant="ghost" onClick={() => alert('Cancel clicked!')}>
            Cancel
          </Button>
        </div>
      </div>
    )
  },
}