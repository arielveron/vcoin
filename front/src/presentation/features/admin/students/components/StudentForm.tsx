/**
 * Student Form Component
 * Handles create/edit student modal form
 * Extracted from students-admin-client.tsx
 */
import { X } from 'lucide-react'
import { useServerAction } from '@/presentation/hooks'
import type { Student, Class } from '@/types/database'
import type { ActionResult } from '@/utils/server-actions'
import { t } from '@/config/translations'

interface StudentFormProps {
  editingStudent: Student | null
  classes: Class[]
  classId?: number
  onSubmit: (formData: FormData) => Promise<ActionResult<Student>>
  onSuccess: (student: Student) => void
  onCancel: () => void
}

export default function StudentForm({
  editingStudent,
  classes,
  classId,
  onSubmit,
  onSuccess,
  onCancel
}: StudentFormProps) {
  const { execute, loading } = useServerAction(onSubmit)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await execute(formData)
    if (result?.success && result?.data) {
      onSuccess(result.data)
    } else {
      alert(result?.error || (editingStudent ? 'Error al actualizar estudiante' : 'Error al crear estudiante'))
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
        <div className="flex flex-col h-full lg:h-auto">
          <div className="flex items-center justify-between p-4 border-b lg:border-0">
            <h3 className="text-lg font-medium text-gray-900">
              {editingStudent ? t('students.edit') : t('students.createNew')}
            </h3>
            <button
              onClick={onCancel}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form 
            key={editingStudent ? `edit-${editingStudent.id}` : `create-${classId || 'all'}`}
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('students.studentName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  defaultValue={editingStudent?.name || ''}
                  placeholder={editingStudent ? '' : t('students.enterStudentName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
              <div>
                <label htmlFor="registro" className="block text-sm font-medium text-gray-700">
                  Número de Registro
                </label>
                <input
                  type="number"
                  id="registro"
                  name="registro"
                  required
                  defaultValue={editingStudent?.registro || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('students.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  defaultValue={editingStudent?.email || ''}
                  placeholder={editingStudent ? '' : t('students.enterEmail')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                />
              </div>
              <div>
                <label htmlFor="class_id" className="block text-sm font-medium text-gray-700">
                  {t('students.class')}
                </label>
                <select
                  id="class_id"
                  name="class_id"
                  required
                  defaultValue={editingStudent?.class_id || (classId ? classId.toString() : '')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                >
                  <option value="">{t('students.selectClass')}</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
              <button
                type="button"
                onClick={onCancel}
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                {t('students.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingStudent ? t('students.update') : t('students.create'))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
