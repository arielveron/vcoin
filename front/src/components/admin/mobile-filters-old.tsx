'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Class, Student } from '@/types/database'

interface MobileFiltersProps {
  classes?: Class[]
  students?: Student[]
  currentClassId?: number | null
  currentStudentId?: number | null
  onClassChange: (classId: number | null) => void
  onStudentChange?: (studentId: number | null) => void
  onClearFilters?: () => void
  showStudentFilter?: boolean
}

export default function MobileFilters({
  classes = [],
  students = [],
  currentClassId,
  currentStudentId,
  onClassChange,
  onStudentChange,
  onClearFilters,
  showStudentFilter = false
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const activeFiltersCount = 
    (currentClassId ? 1 : 0) + 
    (currentStudentId ? 1 : 0)

  const handleClassChange = (value: string) => {
    const classId = value ? parseInt(value) : null
    onClassChange(classId)
    // Don't manually clear student filter - let useAdminFilters hook handle it
  }

  const clearFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      // Fallback: only clear class filter, let hook handle student filter
      onClassChange(null)
    }
    setIsOpen(false) // Close modal after clearing
  }

  const filteredStudents = currentClassId 
    ? students.filter(s => s.class_id === currentClassId)
    : students

  return (
    <>
      {/* Filter Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
      >
        <Filter className="h-4 w-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Desktop Filters - Hidden on Mobile */}
      <div className="hidden lg:flex gap-2">
        <select
          value={currentClassId || ''}
          onChange={(e) => handleClassChange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Todas las Clases</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        
        {showStudentFilter && currentClassId && (
          <select
            value={currentStudentId || ''}
            onChange={(e) => onStudentChange?.(e.target.value ? parseInt(e.target.value) : null)}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Todos los Estudiantes</option>
            {filteredStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} (#{student.registro})
              </option>
            ))}
          </select>
        )}
        
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl z-50 lg:hidden max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Clase
                  </label>
                  <select
                    value={currentClassId || ''}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                  >
                    <option value="">Todas las Clases</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {showStudentFilter && currentClassId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estudiante
                    </label>
                    <select
                      value={currentStudentId || ''}
                      onChange={(e) => onStudentChange?.(e.target.value ? parseInt(e.target.value) : null)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3"
                    >
                      <option value="">Todos los Estudiantes</option>
                      {filteredStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} (#{student.registro})
                        </option>
                      ))}
                    </select>
                    {filteredStudents.length > 10 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {filteredStudents.length} estudiantes disponibles
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={clearFilters}
                    className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Limpiar Filtros
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
