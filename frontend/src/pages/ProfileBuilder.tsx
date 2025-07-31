import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { 
  FiEdit3, FiX, FiPlus, FiMove, FiTrash2, FiEye, FiLayout 
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
      layout: 'single'
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
      layout: 'single'
    },
    visible: true
  },
  {
    id: 'skills',
    type: 'skills',
    title: 'Skills',
    content: {
      skills: [
        { name: 'React', level: 90 },
        { name: 'TypeScript', level: 85 },
        { name: 'Node.js', level: 80 },
        { name: 'Go', level: 75 }
      ]
    },
    styles: {
      backgroundColor: '#F9FAFB',
      textColor: '#1F2937',
      padding: 'medium',
      borderRadius: 'lg',
      layout: 'two-column'
    },
    visible: true
  }
]

const sectionTemplates = [
  { type: 'hero', name: 'Hero Section', icon: '🎯' },
  { type: 'about', name: 'About Me', icon: '👤' },
  { type: 'skills', name: 'Skills', icon: '⚡' },
  { type: 'experience', name: 'Experience', icon: '💼' },
  { type: 'education', name: 'Education', icon: '🎓' },
  { type: 'projects', name: 'Projects', icon: '🚀' },
  { type: 'contact', name: 'Contact', icon: '📞' },
  { type: 'custom', name: 'Custom Section', icon: '✨' }
]

export const ProfileBuilder = () => {
  const [sections, setSections] = useState<Section[]>(defaultSections)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

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
        layout: 'single'
      },
      visible: true
    }
    setSections([...sections, newSection])
    setShowTemplates(false)
  }

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'hero':
        return { name: 'Your Name', title: 'Your Title', tagline: 'Your Tagline' }
      case 'about':
        return { text: 'Tell us about yourself...', highlights: [] }
      case 'skills':
        return { skills: [] }
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
  }

  const toggleSectionVisibility = (sectionId: string) => {
    updateSection(sectionId, { visible: !sections.find(s => s.id === sectionId)?.visible })
  }

  const SectionEditor = ({ section }: { section: Section }) => {
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [colorType, setColorType] = useState<'background' | 'text'>('background')

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Edit {section.title}</h2>
            <button
              onClick={() => setSelectedSection(null)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Content Editor */}
            <div>
              <h3 className="text-lg font-medium mb-3">Content</h3>
              {section.type === 'hero' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={section.content.name}
                    onChange={(e) => updateSection(section.id, {
                      content: { ...section.content, name: e.target.value }
                    })}
                    placeholder="Your Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="text"
                    value={section.content.title}
                    onChange={(e) => updateSection(section.id, {
                      content: { ...section.content, title: e.target.value }
                    })}
                    placeholder="Your Title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <input
                    type="text"
                    value={section.content.tagline}
                    onChange={(e) => updateSection(section.id, {
                      content: { ...section.content, tagline: e.target.value }
                    })}
                    placeholder="Your Tagline"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
              )}

              {section.type === 'about' && (
                <textarea
                  value={section.content.text}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...section.content, text: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              )}

              {section.type === 'custom' && (
                <textarea
                  value={section.content.text}
                  onChange={(e) => updateSection(section.id, {
                    content: { ...section.content, text: e.target.value }
                  })}
                  rows={6}
                  placeholder="Enter your custom content..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              )}
            </div>

            {/* Style Editor */}
            <div>
              <h3 className="text-lg font-medium mb-3">Styling</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setColorType('background')
                        setShowColorPicker(!showColorPicker)
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: section.styles.backgroundColor }}
                    />
                    <span className="text-sm text-gray-600">{section.styles.backgroundColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setColorType('text')
                        setShowColorPicker(!showColorPicker)
                      }}
                      className="w-8 h-8 rounded border-2 border-gray-300"
                      style={{ backgroundColor: section.styles.textColor }}
                    />
                    <span className="text-sm text-gray-600">{section.styles.textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Padding</label>
                  <select
                    value={section.styles.padding}
                    onChange={(e) => updateSection(section.id, {
                      styles: { ...section.styles, padding: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                  <select
                    value={section.styles.layout}
                    onChange={(e) => updateSection(section.id, {
                      styles: { ...section.styles, layout: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="single">Single Column</option>
                    <option value="two-column">Two Columns</option>
                    <option value="three-column">Three Columns</option>
                  </select>
                </div>
              </div>

              {showColorPicker && (
                <div className="absolute z-10 mt-2">
                  <div className="bg-white p-4 rounded-lg shadow-xl border">
                    <HexColorPicker
                      color={colorType === 'background' ? section.styles.backgroundColor : section.styles.textColor}
                      onChange={(color) => {
                        if (colorType === 'background') {
                          updateSection(section.id, {
                            styles: { ...section.styles, backgroundColor: color }
                          })
                        } else {
                          updateSection(section.id, {
                            styles: { ...section.styles, textColor: color }
                          })
                        }
                      }}
                    />
                    <button
                      onClick={() => setShowColorPicker(false)}
                      className="w-full mt-3 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
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

    return (
      <Draggable draggableId={section.id} index={index} isDragDisabled={previewMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`relative group ${snapshot.isDragging ? 'z-50' : ''}`}
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
                  onClick={() => toggleSectionVisibility(section.id)}
                  className={`p-1 rounded ${section.visible ? 'bg-green-600' : 'bg-gray-400'} text-white hover:opacity-80`}
                >
                  <FiEye size={12} />
                </button>
                <button
                  onClick={() => setSelectedSection(section.id)}
                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <FiEdit3 size={12} />
                </button>
                <button
                  onClick={() => deleteSection(section.id)}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}

            {section.visible && (
              <div
                className={`${paddingClass} rounded-lg mb-4 ${!previewMode ? 'border-2 border-dashed border-transparent hover:border-primary-300' : ''}`}
                style={{
                  backgroundColor: section.styles.backgroundColor,
                  color: section.styles.textColor
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

                {section.type === 'custom' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
                    <div className="prose prose-lg">
                      <p>{section.content.text}</p>
                    </div>
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
              </div>
            )}
          </div>
        )}
      </Draggable>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Builder</h1>
          <p className="text-gray-600 mt-1">Drag & drop to customize your portfolio</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              previewMode ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <FiEye size={16} />
            <span>{previewMode ? 'Exit Preview' : 'Preview'}</span>
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <FiPlus size={16} />
            <span>Add Section</span>
          </button>
        </div>
      </div>

      {/* Builder Area */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {sections.map((section, index) => (
                  <SectionPreview key={section.id} section={section} index={index} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {sections.length === 0 && (
          <div className="text-center py-12">
            <FiLayout size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-600">Add your first section to get started</p>
          </div>
        )}
      </div>

      {/* Section Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Section</h2>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sectionTemplates.map((template) => (
                <button
                  key={template.type}
                  onClick={() => addSection(template.type)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
                >
                  <div className="text-2xl mb-2">{template.icon}</div>
                  <div className="text-sm font-medium">{template.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section Editor Modal */}
      {selectedSection && (
        <SectionEditor 
          section={sections.find(s => s.id === selectedSection)!} 
        />
      )}
    </div>
  )
}