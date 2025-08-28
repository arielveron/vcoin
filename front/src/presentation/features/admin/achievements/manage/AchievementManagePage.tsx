/**
 * Achievement Management Page Component
 * Main orchestrator component for achievement CRUD operations
 * Refactored from 941-line achievement-crud-client.tsx following VCoin architectural guidelines
 */
'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Achievement } from '@/types/database'
import type { AchievementManagePageProps } from '@/utils/admin-server-action-types'
import { AchievementTable, AchievementForm } from './components'
import { useAchievementManagement } from './hooks'
import { useFormModal } from '@/presentation/hooks'

export default function AchievementManagePage({ 
  achievements, 
  categories,
  createAchievement,
  updateAchievement,
  deleteAchievement
}: AchievementManagePageProps) {
  const [achievementList, setAchievementList] = useState<Achievement[]>(achievements)
  
  const { isOpen: isCreateModalOpen, openCreateModal, closeModal: closeCreateModal } = useFormModal<Achievement>()
  const { isOpen: isEditModalOpen, openEditModal, closeModal: closeEditModal } = useFormModal<Achievement>()
  
  const {
    editingAchievement,
    setEditingAchievement,
    handleCreate,
    handleUpdate,
    handleDelete,
    isSubmitting
  } = useAchievementManagement({
    createAchievement,
    updateAchievement,
    deleteAchievement,
    onCreateSuccess: (newAchievement: Achievement) => {
      setAchievementList([...achievementList, newAchievement])
      closeCreateModal()
    },
    onUpdateSuccess: (updatedAchievement: Achievement) => {
      setAchievementList(achievementList.map(a => 
        a.id === updatedAchievement.id ? updatedAchievement : a
      ))
      setEditingAchievement(null)
      closeEditModal()
    },
    onDeleteSuccess: (deletedId: number) => {
      setAchievementList(achievementList.filter(a => a.id !== deletedId))
    }
  })

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement)
    openEditModal(achievement)
  }

  const handleCloseEdit = () => {
    setEditingAchievement(null)
    closeEditModal()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Achievements</h1>
          <p className="text-gray-600">Create, edit, and organize achievements for the student investment system.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Achievement
        </button>
      </div>

      {/* Achievement Table */}
      <AchievementTable
        achievements={achievementList}
        onEdit={handleEdit}
        onDelete={(id: number) => handleDelete(id)}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={closeCreateModal}
            ></div>
            
            <div 
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Create New Achievement
                  </h3>
                  <button
                    onClick={closeCreateModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <AchievementForm
                  onSubmit={handleCreate}
                  onCancel={closeCreateModal}
                  submitLabel="Create Achievement"
                  isSubmitting={isSubmitting}
                  categories={categories}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Edit Achievement
                </h3>
                <button
                  onClick={handleCloseEdit}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <AchievementForm
                achievement={editingAchievement}
                onSubmit={handleUpdate}
                onCancel={handleCloseEdit}
                submitLabel="Update Achievement"
                isSubmitting={isSubmitting}
                categories={categories}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
