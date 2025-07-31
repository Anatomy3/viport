import { useState } from 'react'
import { FiEdit3, FiSave, FiX, FiCamera, FiMapPin, FiGlobe, FiLinkedin, FiGithub, FiTwitter } from 'react-icons/fi'

interface ProfileData {
  name: string
  title: string
  bio: string
  location: string
  website: string
  skills: string[]
  experience: {
    id: string
    company: string
    position: string
    duration: string
    description: string
  }[]
  education: {
    id: string
    school: string
    degree: string
    year: string
  }[]
  projects: {
    id: string
    name: string
    description: string
    tech: string[]
    link?: string
  }[]
  social: {
    linkedin?: string
    github?: string
    twitter?: string
  }
}

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    title: 'Senior Full Stack Developer',
    bio: 'Passionate developer with 5+ years of experience building scalable web applications. I love creating user-centric solutions and working with modern technologies.',
    location: 'Jakarta, Indonesia',
    website: 'https://johndoe.dev',
    skills: ['React', 'TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS'],
    experience: [
      {
        id: '1',
        company: 'Tech Startup Inc.',
        position: 'Senior Full Stack Developer',
        duration: '2022 - Present',
        description: 'Lead development of enterprise applications using React, Node.js, and PostgreSQL. Mentor junior developers and architect scalable solutions.'
      },
      {
        id: '2',
        company: 'Digital Agency Co.',
        position: 'Full Stack Developer',
        duration: '2020 - 2022',
        description: 'Developed web applications for various clients using modern frameworks and technologies.'
      }
    ],
    education: [
      {
        id: '1',
        school: 'University of Indonesia',
        degree: 'Bachelor of Computer Science',
        year: '2016 - 2020'
      }
    ],
    projects: [
      {
        id: '1',
        name: 'E-Commerce Platform',
        description: 'Full-featured e-commerce platform with payment integration, inventory management, and admin dashboard.',
        tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        link: 'https://github.com/johndoe/ecommerce'
      },
      {
        id: '2',
        name: 'Task Management App',
        description: 'Collaborative task management application with real-time updates and team collaboration features.',
        tech: ['React', 'TypeScript', 'Socket.io', 'MongoDB'],
        link: 'https://github.com/johndoe/taskapp'
      }
    ],
    social: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe'
    }
  })

  const [editData, setEditData] = useState<ProfileData>(profileData)

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(profileData)
    setIsEditing(false)
  }

  const addSkill = () => {
    setEditData({
      ...editData,
      skills: [...editData.skills, '']
    })
  }

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...editData.skills]
    newSkills[index] = value
    setEditData({
      ...editData,
      skills: newSkills
    })
  }

  const removeSkill = (index: number) => {
    setEditData({
      ...editData,
      skills: editData.skills.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">My Portfolio</h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <FiSave size={16} />
                <span>Save</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <FiX size={16} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FiEdit3 size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="card">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg mb-16">
            {isEditing && (
              <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/30">
                <FiCamera size={16} />
              </button>
            )}
          </div>
          
          {/* Profile Picture */}
          <div className="absolute left-6 -bottom-12 w-24 h-24 bg-gray-300 rounded-full border-4 border-white flex items-center justify-center">
            <span className="text-2xl text-gray-600">JD</span>
            {isEditing && (
              <button className="absolute inset-0 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <FiCamera size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 ml-32">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="text-2xl font-bold border-b-2 border-gray-300 focus:border-primary-500 outline-none bg-transparent"
              />
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="text-lg text-gray-600 border-b border-gray-300 focus:border-primary-500 outline-none bg-transparent w-full"
              />
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FiMapPin size={16} className="text-gray-400" />
                  <input
                    type="text"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                    className="border-b border-gray-300 focus:border-primary-500 outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <FiGlobe size={16} className="text-gray-400" />
                  <input
                    type="text"
                    value={editData.website}
                    onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                    className="border-b border-gray-300 focus:border-primary-500 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{profileData.name}</h2>
              <p className="text-lg text-gray-600 mb-2">{profileData.title}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FiMapPin size={14} />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiGlobe size={14} />
                  <a href={profileData.website} className="text-primary-600 hover:text-primary-700">
                    {profileData.website}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">About</h3>
        {isEditing ? (
          <textarea
            value={editData.bio}
            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        ) : (
          <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
        )}
      </div>

      {/* Skills */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {(isEditing ? editData : profileData).skills.map((skill, index) => (
            <div key={index} className="relative group">
              {isEditing ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                  <button
                    onClick={() => removeSkill(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ) : (
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                  {skill}
                </span>
              )}
            </div>
          ))}
          {isEditing && (
            <button
              onClick={addSkill}
              className="px-3 py-1 border-2 border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-primary-500 hover:text-primary-600"
            >
              + Add Skill
            </button>
          )}
        </div>
      </div>

      {/* Experience & Education Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Experience */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Experience</h3>
          <div className="space-y-4">
            {profileData.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-primary-200 pl-4">
                <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                <p className="text-primary-600 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                <p className="text-sm text-gray-700">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Education</h3>
          <div className="space-y-4">
            {profileData.education.map((edu) => (
              <div key={edu.id} className="border-l-2 border-primary-200 pl-4">
                <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                <p className="text-primary-600 font-medium">{edu.school}</p>
                <p className="text-sm text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Projects</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {profileData.projects.map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
              <p className="text-sm text-gray-700 mb-3">{project.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {project.tech.map((tech, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tech}
                  </span>
                ))}
              </div>
              {project.link && (
                <a 
                  href={project.link} 
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Project →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect</h3>
        <div className="flex space-x-4">
          {profileData.social.linkedin && (
            <a 
              href={profileData.social.linkedin}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin size={20} />
              <span>LinkedIn</span>
            </a>
          )}
          {profileData.social.github && (
            <a 
              href={profileData.social.github}
              className="flex items-center space-x-2 text-gray-800 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub size={20} />
              <span>GitHub</span>
            </a>
          )}
          {profileData.social.twitter && (
            <a 
              href={profileData.social.twitter}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiTwitter size={20} />
              <span>Twitter</span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}