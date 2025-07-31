import { useState } from 'react'
import { FiCamera, FiSave, FiX } from 'react-icons/fi'
import { User } from '@/types'

interface ProfileEditorProps {
  user: User
  onSave: (updatedUser: Partial<User>) => void
  onCancel: () => void
}

export const ProfileEditor = ({ user, onSave, onCancel }: ProfileEditorProps) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    displayName: user.displayName || '',
    bio: user.bio || '',
    location: user.location || '',
    websiteUrl: user.websiteUrl || '',
  })

  const [avatarPreview, setAvatarPreview] = useState(user.avatarUrl || '')
  const [coverPreview, setCoverPreview] = useState(user.coverImageUrl || '')

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setCoverPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updatedData: Partial<User> = {
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      displayName: formData.displayName || undefined,
      bio: formData.bio || undefined,
      location: formData.location || undefined,
      websiteUrl: formData.websiteUrl || undefined,
      avatarUrl: avatarPreview !== user.avatarUrl ? avatarPreview : undefined,
      coverImageUrl: coverPreview !== user.coverImageUrl ? coverPreview : undefined,
    }

    onSave(updatedData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profil</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Sampul
            </label>
            <div className="relative">
              <div 
                className="w-full h-32 bg-gray-200 rounded-lg bg-cover bg-center relative overflow-hidden"
                style={{ 
                  backgroundImage: coverPreview ? `url(${coverPreview})` : 'none' 
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <FiCamera size={24} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto Profil
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div 
                  className="w-20 h-20 bg-gray-200 rounded-full bg-cover bg-center relative overflow-hidden"
                  style={{ 
                    backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none' 
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <FiCamera size={16} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Klik untuk mengubah foto profil</p>
                <p className="text-xs text-gray-500">JPG, PNG max. 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Depan
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Belakang
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Tampilan
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nama yang akan ditampilkan di profil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Ceritakan tentang diri Anda..."
              maxLength={160}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/160 karakter
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Kota, Negara"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.websiteUrl}
              onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://website-anda.com"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiSave size={16} />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}