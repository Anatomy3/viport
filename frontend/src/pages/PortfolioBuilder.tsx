import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  FiEdit3, FiMove, FiTrash2, FiEye, FiLayout, 
  FiSave, FiMonitor, FiTablet, FiSmartphone, FiSettings
} from 'react-icons/fi'
import { HexColorPicker } from 'react-colorful'

interface Section {
  id: string
  type: 'hero' | 'about' | 'skills' | 'experience' | 'education' | 'projects' | 'contact' | 'custom'
  title: string
  content: any
  styles: {
    backgroundColor: string
    textColor: string
    padding: string
    borderRadius: string
    layout: 'single' | 'two-column' | 'three-column'
    minHeight: string
  }
  visible: boolean
}

const defaultSections: Section[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'Hero Section',
    content: {
      name: 'John Doe',
      title: 'Senior Full Stack Developer',
      tagline: 'Building amazing web experiences',
      image: '',
      backgroundImage: ''
    },
    styles: {
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      padding: 'large',
      borderRadius: 'lg',
      layout: 'single',
      minHeight: '400px'
    },
    visible: true
  },
  {
    id: 'about',
    type: 'about',
    title: 'About Me',
    content: {
      text: 'Passionate developer with 5+ years of experience building scalable web applications.',
      highlights: ['Full Stack Development', 'Team Leadership', 'Product Strategy']
    },
    styles: {
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      padding: 'medium',
      borderRadius: 'lg',
      layout: 'single',
      minHeight: '200px'
    },
    visible: true
  }
]

const sectionTemplates = [
  { type: 'hero', name: 'Hero Section', icon: '🎯', description: 'Main banner with name and title' },
  { type: 'about', name: 'About Me', icon: '👤', description: 'Personal introduction' },
  { type: 'skills', name: 'Skills', icon: '⚡', description: 'Technical skills with progress bars' },
  { type: 'experience', name: 'Experience', icon: '💼', description: 'Work experience timeline' },
  { type: 'education', name: 'Education', icon: '🎓', description: 'Educational background' },
  { type: 'projects', name: 'Projects', icon: '🚀', description: 'Featured projects showcase' },
  { type: 'contact', name: 'Contact', icon: '📞', description: 'Contact information and form' },
  { type: 'custom', name: 'Custom Section', icon: '✨', description: 'Create your own content' }
]

export const PortfolioBuilder = () => {
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorType, setColorType] = useState<'background' | 'text'>('background')

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    setSections(items)
  }

  const addSection = (type: string) => {
    const newSection: Section = {
      id: `${type}-${Date.now()}`,
      type: type as any,
      title: sectionTemplates.find(t => t.type === type)?.name || 'New Section',
      content: getDefaultContent(type),
      styles: {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: 'medium',
        borderRadius: 'lg',
        layout: 'single',
        minHeight: '200px'
      },
      visible: true
    }
    setSections([...sections, newSection])
  }

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return { name: 'Your Name', title: 'Your Title', tagline: 'Your Tagline' }
      case 'about':
        return { text: 'Tell us about yourself...', highlights: [] }
      case 'skills':
        return { skills: [{ name: 'React', level: 90 }, { name: 'TypeScript', level: 85 }] }
      case 'experience':
        return { experiences: [] }
      case 'education':
        return { education: [] }
      case 'projects':
        return { projects: [] }
      case 'contact':
        return { email: '', phone: '', social: {} }
      default:
        return { text: 'Custom content...' }
    }
  }

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ))
  }

  const deleteSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId))
    setSelectedSection(null)
  }

  const toggleSectionVisibility = (sectionId: string) => {
    updateSection(sectionId, { visible: !sections.find(s => s.id === sectionId)?.visible })
  }

  const selectedSectionData = selectedSection ? sections.find(s => s.id === selectedSection) : null

  const getDeviceClass = () => {
    switch (deviceView) {
      case 'tablet': return 'max-w-3xl'
      case 'mobile': return 'max-w-sm'
      default: return 'max-w-none'
    }
  }

  const SectionPreview = ({ section, index }: { section: Section; index: number }) => {
    const paddingClass = {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-8'
    }[section.styles.padding]

    const layoutClass = {
      single: 'grid-cols-1',
      'two-column': 'grid-cols-2',
      'three-column': 'grid-cols-3'
    }[section.styles.layout]

    const isSelected = selectedSection === section.id

    return (
      <Draggable draggableId={section.id} index={index} isDragDisabled={previewMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`relative group mb-2 ${snapshot.isDragging ? 'z-50' : ''}`}
            onClick={() => setSelectedSection(section.id)}
          >
            {!previewMode && (
              <div className="absolute -top-2 -right-2 z-10 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  {...provided.dragHandleProps}
                  className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700"
                >
                  <FiMove size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSectionVisibility(section.id)
                  }}
                  className={`p-1 rounded ${section.visible ? 'bg-green-600' : 'bg-gray-400'} text-white hover:opacity-80`}
                >
                  <FiEye size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteSection(section.id)
                  }}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}

            {section.visible && (
              <div
                className={`${paddingClass} rounded-lg cursor-pointer transition-all ${
                  !previewMode ? (isSelected ? 'ring-2 ring-primary-500' : 'border-2 border-dashed border-transparent hover:border-primary-300') : ''
                }`}
                style={{
                  backgroundColor: section.styles.backgroundColor,
                  color: section.styles.textColor,
                  minHeight: section.styles.minHeight
                }}
              >
                {section.type === 'hero' && (
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-2">{section.content.name}</h1>
                    <h2 className="text-xl mb-4">{section.content.title}</h2>
                    <p className="text-lg opacity-90">{section.content.tagline}</p>
                  </div>
                )}

                {section.type === 'about' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <p className="text-lg leading-relaxed">{section.content.text}</p>
                  </div>
                )}

                {section.type === 'skills' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <div className={`grid gap-4 ${layoutClass}`}>
                      {section.content.skills?.map((skill: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between">
                            <span>{skill.name}</span>
                            <span>{skill.level}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-current h-2 rounded-full" 
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        </div>
                      )) || <p>No skills added yet</p>}
                    </div>
                  </div>
                )}

                {section.type === 'custom' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <div className="prose prose-lg">
                      <p>{section.content.text}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <div className="h-full flex bg-gray-100 overflow-hidden">
      {/* Left Panel - Components Library */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Components</h2>
          <p className="text-sm text-gray-600">Drag sections to build your portfolio</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {sectionTemplates.map((template) => (
              <div
                key={template.type}
                onClick={() => addSection(template.type)}
                className="p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Panel - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">Portfolio Builder</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDeviceView('desktop')}
                className={`p-2 rounded ${deviceView === 'desktop' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FiMonitor size={16} />
              </button>
              <button
                onClick={() => setDeviceView('tablet')}
                className={`p-2 rounded ${deviceView === 'tablet' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FiTablet size={16} />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                className={`p-2 rounded ${deviceView === 'mobile' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <FiSmartphone size={16} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              <FiEye size={16} />
              <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
            </button>
            <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
              <FiSave size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className={`mx-auto bg-white shadow-lg rounded-lg overflow-hidden ${getDeviceClass()}`}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-screen">
                    {sections.map((section, index) => (
                      <SectionPreview key={section.id} section={section} index={index} />
                    ))}
                    {provided.placeholder}
                    
                    {sections.length === 0 && (
                      <div className="text-center py-24">
                        <FiLayout size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building</h3>
                        <p className="text-gray-600">Add components from the left panel to get started</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <FiSettings size={16} />
            <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          </div>
          <p className="text-sm text-gray-600">
            {selectedSectionData ? `Editing: ${selectedSectionData.title}` : 'Select a section to edit'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {selectedSectionData ? (
            <div className="space-y-6">
              {/* Content Editor */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Content</h3>
                
                {selectedSectionData.type === 'hero' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={selectedSectionData.content.name}
                        onChange={(e) => updateSection(selectedSectionData.id, {
                          content: { ...selectedSectionData.content, name: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={selectedSectionData.content.title}
                        onChange={(e) => updateSection(selectedSectionData.id, {
                          content: { ...selectedSectionData.content, title: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tagline</label>
                      <input
                        type="text"
                        value={selectedSectionData.content.tagline}
                        onChange={(e) => updateSection(selectedSectionData.id, {
                          content: { ...selectedSectionData.content, tagline: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedSectionData.type === 'about' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">About Text</label>
                    <textarea
                      value={selectedSectionData.content.text}
                      onChange={(e) => updateSection(selectedSectionData.id, {
                        content: { ...selectedSectionData.content, text: e.target.value }
                      })}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                )}

                {selectedSectionData.type === 'custom' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={selectedSectionData.content.text}
                      onChange={(e) => updateSection(selectedSectionData.id, {
                        content: { ...selectedSectionData.content, text: e.target.value }
                      })}
                      rows={6}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Style Editor */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Styling</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Background</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setColorType('background')
                            setShowColorPicker(!showColorPicker)
                          }}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: selectedSectionData.styles.backgroundColor }}
                        />
                        <input
                          type="text"
                          value={selectedSectionData.styles.backgroundColor}
                          onChange={(e) => updateSection(selectedSectionData.id, {
                            styles: { ...selectedSectionData.styles, backgroundColor: e.target.value }
                          })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Text Color</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setColorType('text')
                            setShowColorPicker(!showColorPicker)
                          }}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: selectedSectionData.styles.textColor }}
                        />
                        <input
                          type="text"
                          value={selectedSectionData.styles.textColor}
                          onChange={(e) => updateSection(selectedSectionData.id, {
                            styles: { ...selectedSectionData.styles, textColor: e.target.value }
                          })}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Padding</label>
                    <select
                      value={selectedSectionData.styles.padding}
                      onChange={(e) => updateSection(selectedSectionData.id, {
                        styles: { ...selectedSectionData.styles, padding: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Layout</label>
                    <select
                      value={selectedSectionData.styles.layout}
                      onChange={(e) => updateSection(selectedSectionData.id, {
                        styles: { ...selectedSectionData.styles, layout: e.target.value as any }
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                      <option value="single">Single Column</option>
                      <option value="two-column">Two Columns</option>
                      <option value="three-column">Three Columns</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Min Height</label>
                    <input
                      type="text"
                      value={selectedSectionData.styles.minHeight}
                      onChange={(e) => updateSection(selectedSectionData.id, {
                        styles: { ...selectedSectionData.styles, minHeight: e.target.value }
                      })}
                      placeholder="200px"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {showColorPicker && (
                <div className="relative">
                  <div className="absolute z-10 right-0">
                    <div className="bg-white p-4 rounded-lg shadow-xl border">
                      <HexColorPicker
                        color={colorType === 'background' ? selectedSectionData.styles.backgroundColor : selectedSectionData.styles.textColor}
                        onChange={(color) => {
                          if (colorType === 'background') {
                            updateSection(selectedSectionData.id, {
                              styles: { ...selectedSectionData.styles, backgroundColor: color }
                            })
                          } else {
                            updateSection(selectedSectionData.id, {
                              styles: { ...selectedSectionData.styles, textColor: color }
                            })
                          }
                        }}
                      />
                      <button
                        onClick={() => setShowColorPicker(false)}
                        className="w-full mt-3 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <FiEdit3 size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select a section from the canvas to edit its properties</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}