'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { useAdminFilters } from '@/presentation/features/admin/hooks/useAdminFilters'
import { Class, Student } from '@/types/database'

interface MobileFiltersProps {
  classes: Class[]
  students?: Student[]
  showStudentFilter?: boolean
}

export default function MobileFilters({
  classes,
  students = [],
  showStudentFilter = false
}: MobileFiltersProps) {
  const { filters, updateFilters } = useAdminFilters()
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = 
    (filters.classId ? 1 : 0) + 
    (filters.studentId ? 1 : 0)

  const handleClassChange = (value: string) => {
    const classId = value ? parseInt(value) : null
    updateFilters({ classId })
  }

  const handleStudentChange = (value: string) => {
    const studentId = value ? parseInt(value) : null
    updateFilters({ studentId })
  }

  const clearFilters = () => {
    updateFilters({ classId: null, studentId: null })
    setIsOpen(false)
  }

  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  return (
    <>
      {/* Filter Button - Show only on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
          
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Class Filter */}
              <div>
                <label htmlFor="mobile-class" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Class
                </label>
                <select
                  id="mobile-class"
                  value={filters.classId || ''}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Filter - Show only if enabled and students available */}
              {showStudentFilter && students.length > 0 && (
                <div>
                  <label htmlFor="mobile-student" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Student
                  </label>
                  <select
                    id="mobile-student"
                    value={filters.studentId || ''}
                    onChange={(e) => handleStudentChange(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Students</option>
                    {filteredStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} (#{student.registro})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
