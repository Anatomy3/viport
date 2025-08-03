'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreatePostDialog } from '@/components/posts/create-post-dialog'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import toast from 'react-hot-toast'

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  featured: boolean
  order: number
}

const mockPortfolioItems: PortfolioItem[] = [
  {
    id: '1',
    title: 'E-commerce Website Design',
    description: 'Modern responsive design for online retail platform',
    image: '/api/placeholder/300/200',
    category: 'Web Design',
    featured: true,
    order: 1,
  },
  {
    id: '2',
    title: 'Mobile App UI/UX',
    description: 'Complete mobile application design system',
    image: '/api/placeholder/300/200',
    category: 'Mobile Design',
    featured: false,
    order: 2,
  },
  {
    id: '3',
    title: 'Brand Identity Package',
    description: 'Full brand identity including logo and guidelines',
    image: '/api/placeholder/300/200',
    category: 'Branding',
    featured: true,
    order: 3,
  },
]

export default function PortfolioPage() {
  const [portfolioItems, setPortfolioItems] = useState(mockPortfolioItems)
  const [isCreating, setIsCreating] = useState(false)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(portfolioItems)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update order property
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1,
    }))

    setPortfolioItems(updatedItems)
    toast.success('Portfolio order updated!')
  }

  const toggleFeatured = (itemId: string) => {
    setPortfolioItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, featured: !item.featured } : item
      )
    )
    toast.success('Featured status updated!')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Showcase your best work and projects</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          Add Project
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">All Projects</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{portfolioItems.length}</div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {portfolioItems.filter(item => item.featured).length}
                  </div>
                  <div className="text-sm text-gray-600">Featured Projects</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">1,234</div>
                  <div className="text-sm text-gray-600">Portfolio Views</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Featured Projects</CardTitle>
              <CardDescription>Your highlighted work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {portfolioItems
                  .filter(item => item.featured)
                  .map(item => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="secondary">{item.category}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
              <CardDescription>
                Drag and drop to reorder your portfolio items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="portfolio">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-4"
                    >
                      {portfolioItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center space-x-4 p-4 border rounded-lg bg-white"
                            >
                              <img 
                                src={item.image} 
                                alt={item.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{item.title}</h3>
                                  <Badge variant="outline">{item.category}</Badge>
                                  {item.featured && (
                                    <Badge>Featured</Badge>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleFeatured(item.id)}
                                >
                                  {item.featured ? 'Unfeature' : 'Feature'}
                                </Button>
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Templates</CardTitle>
              <CardDescription>Choose from professional templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {['Modern', 'Classic', 'Creative'].map((template) => (
                  <div key={template} className="border rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gray-100 rounded mb-4"></div>
                    <h3 className="font-semibold mb-2">{template} Template</h3>
                    <Button variant="outline" size="sm">
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Settings</CardTitle>
              <CardDescription>Configure your portfolio preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Public Portfolio</h4>
                    <p className="text-sm text-gray-600">Make your portfolio visible to everyone</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Toggle
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Custom Domain</h4>
                    <p className="text-sm text-gray-600">Use your own domain for portfolio</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreatePostDialog 
        open={isCreating} 
        onOpenChange={setIsCreating}
      />
    </div>
  )
}