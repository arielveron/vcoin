'use client'

import { useState } from 'react'
import { Student, Class } from '@/types/database'
import { createStudent, updateStudent, deleteStudent, setStudentPassword } from './actions'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'
import { t } from '@/config/translations'

interface StudentsAdminClientProps {
  students: Student[]
  classes: Class[]
}

export default function StudentsAdminClient({ students: initialStudents, classes }: StudentsAdminClientProps) {
  const [students, setStudents] = useState(initialStudents)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [passwordDialogStudent, setPasswordDialogStudent] = useState<Student | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [settingPassword, setSettingPassword] = useState(false)
  const { filters, updateFilters } = useAdminFilters()

  const handleCreateStudent = async (formData: FormData) => {
    try {
      const result = await createStudent(formData)
      if (result.success && result.student) {
        setStudents([...students, result.student])
        setShowCreateForm(false)
      } else {
        alert(result.error || 'Error al crear estudiante')
      }
    } catch (error) {
      alert('Error al crear estudiante')
    }
  }

  const handleUpdateStudent = async (formData: FormData) => {
    if (!editingStudent) return
    
    try {
      const result = await updateStudent(editingStudent.id, formData)
      if (result.success && result.student) {
        setStudents(students.map(s => 
          s.id === editingStudent.id ? result.student! : s
        ))
        setEditingStudent(null)
      } else {
        alert(result.error || 'Error al actualizar estudiante')
      }
    } catch (error) {
      alert('Error al actualizar estudiante')
    }
  }

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este estudiante?')) return
    
    try {
      const result = await deleteStudent(id)
      if (result.success) {
        setStudents(students.filter(s => s.id !== id))
      } else {
        alert(result.error || 'Error al eliminar estudiante')
      }
    } catch (error) {
      alert('Error al eliminar estudiante')
    }
  }

  const handleSetPassword = async () => {
    if (!passwordDialogStudent || !newPassword) return
    
    setSettingPassword(true)
    try {
      const formData = new FormData()
      formData.append('student_id', passwordDialogStudent.id.toString())
      formData.append('password', newPassword)

      const result = await setStudentPassword(formData)
      
      if (result.success) {
        // Update student in state to show password is set
        setStudents(students.map(s => 
          s.id === passwordDialogStudent.id 
            ? { ...s, password_hash: 'set' }
            : s
        ))
        setPasswordDialogStudent(null)
        setNewPassword('')
        alert('Password set successfully')
      } else {
        alert(result.error || 'Error setting password')
      }
    } catch (error) {
      alert('Error setting password')
    } finally {
      setSettingPassword(false)
    }
  }

  // Filter students based on selected class
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  return (
    <div className="space-y-6">
      {/* Filter Badges */}
      <FilterBadges classes={classes} students={students} />

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{t('students.title')}</h2>
          <p className="text-gray-600">Total: {filteredStudents.length} {t('students.studentsInClass')}</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filters.classId || ''}
            onChange={(e) => updateFilters({ classId: e.target.value ? parseInt(e.target.value) : null })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">{t('filters.allClasses')}</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            {t('students.createNew')}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('students.createNew')}</h3>
          <form action={handleCreateStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  {t('students.studentName')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder={t('students.enterStudentName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  placeholder={t('students.enterEmail')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {t('students.create')}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                {t('students.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingStudent && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('students.edit')}</h3>
          <form action={handleUpdateStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                  {t('students.studentName')}
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  defaultValue={editingStudent.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-registro" className="block text-sm font-medium text-gray-700">
                  Número de Registro
                </label>
                <input
                  type="number"
                  id="edit-registro"
                  name="registro"
                  defaultValue={editingStudent.registro}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">
                  {t('students.email')}
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  defaultValue={editingStudent.email || ''}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="edit-class_id" className="block text-sm font-medium text-gray-700">
                  {t('students.class')}
                </label>
                <select
                  id="edit-class_id"
                  name="class_id"
                  defaultValue={editingStudent.class_id}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                {t('students.save')}
              </button>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                {t('students.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estudiante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('students.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('students.class')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Password Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('students.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.map((student) => {
              const studentClass = classes.find(c => c.id === student.class_id)
              return (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {student.name}
                      </div>
                      <div className="text-sm text-gray-500">Registro: {student.registro}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email || 'Sin email'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {studentClass?.name || 'Sin clase asignada'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.password_hash 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.password_hash ? 'Set' : 'Not Set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('students.edit')}
                    </button>
                    <button
                      onClick={() => setPasswordDialogStudent(student)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Set Password
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('students.delete')}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {t('students.noStudents')}
          </div>
        )}
      </div>

      {/* Password Dialog */}
      {passwordDialogStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Set Password for {passwordDialogStudent.name}
            </h3>
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>Student login credentials:</p>
                <p><strong>Class ID:</strong> {passwordDialogStudent.class_id}</p>
                <p><strong>Registry:</strong> {passwordDialogStudent.registro}</p>
                <p><strong>Password:</strong> [The password you set above]</p>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleSetPassword}
                disabled={!newPassword || settingPassword}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {settingPassword ? 'Setting...' : 'Set Password'}
              </button>
              <button
                onClick={() => {
                  setPasswordDialogStudent(null)
                  setNewPassword('')
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
