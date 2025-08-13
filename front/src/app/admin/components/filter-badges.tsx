'use client'

import { useAdminFilters } from '@/hooks/useAdminFilters'
import { Class, Student } from '@/types/database'

interface FilterBadgesProps {
  classes: Class[]
  students?: Student[]
}

export default function FilterBadges({ classes, students }: FilterBadgesProps) {
  const { filters, updateFilters } = useAdminFilters()

  const selectedClass = classes.find(c => c.id === filters.classId)
  const selectedStudent = students?.find(s => s.id === filters.studentId)

  if (!selectedClass && !selectedStudent) {
    return null
  }

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-gray-500">Filtros activos:</span>
      
      {selectedClass && (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
          <span>Clase: {selectedClass.name}</span>
          <button
            onClick={() => updateFilters({ classId: null })}
            className="ml-1 hover:bg-indigo-200 rounded-full p-0.5"
          >
            ×
          </button>
        </div>
      )}
      
      {selectedStudent && (
        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          <span>Estudiante: {selectedStudent.name}</span>
          <button
            onClick={() => updateFilters({ studentId: null })}
            className="ml-1 hover:bg-green-200 rounded-full p-0.5"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
