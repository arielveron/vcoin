/**
 * Password Dialog Component
 * Handles setting student passwords
 * Extracted from students-admin-client.tsx
 */
import { useState } from 'react'
import { X } from 'lucide-react'
import { useServerAction } from '@/presentation/hooks'
import type { Student } from '@/types/database'
import type { ActionResult, PasswordResult } from '@/utils/admin-server-action-types'

interface PasswordDialogProps {
  student: Student
  onSubmit: (formData: FormData) => Promise<ActionResult<PasswordResult>>
  onSuccess: (student: Student) => void
  onCancel: () => void
}

export default function PasswordDialog({
  student,
  onSubmit,
  onSuccess,
  onCancel
}: PasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('')
  const { execute, loading } = useServerAction(onSubmit)

  const handleSetPassword = async () => {
    if (!newPassword) return
    
    const formData = new FormData()
    formData.append('student_id', student.id.toString())
    formData.append('password', newPassword)

    const result = await execute(formData)
    
    if (result?.success) {
      onSuccess(student)
      setNewPassword('')
      alert('Password set successfully')
    } else {
      alert(result?.error || 'Error setting password')
    }
  }

  const handleCancel = () => {
    setNewPassword('')
    onCancel()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Set Password for {student.name}
          </h3>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
              placeholder="Enter new password"
              minLength={6}
            />
          </div>
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            <p className="font-medium mb-2">Student login credentials:</p>
            <p><strong>Class ID:</strong> {student.class_id}</p>
            <p><strong>Registry:</strong> {student.registro}</p>
            <p><strong>Password:</strong> [The password you set above]</p>
          </div>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row gap-2 mt-6">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSetPassword}
            disabled={!newPassword || loading}
            className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Setting...' : 'Set Password'}
          </button>
        </div>
      </div>
    </div>
  )
}
