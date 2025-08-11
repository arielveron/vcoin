/**
 * Investment Filters Component
 * Handles filtering of investments by class and student
 */
'use client'

import type { Class, Student } from '@/types/database'

interface AdminFilters {
  classId: number | null
  studentId: number | null
}

interface InvestmentFiltersProps {
  classes: Class[]
  students: Student[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function InvestmentFilters({
  classes,
  students,
  filters,
  onFiltersChange,
  className = ""
}: InvestmentFiltersProps) {
  // Filter students by class if a class filter is active
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Class Filter */}
      <select
        value={filters.classId || ''}
        onChange={(e) => onFiltersChange({ 
          classId: e.target.value ? parseInt(e.target.value) : null,
          studentId: null // Reset student filter when class changes
        })}
        className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">All Classes</option>
        {classes.map((cls) => (
          <option key={cls.id} value={cls.id}>{cls.name}</option>
        ))}
      </select>
      
      {/* Student Filter */}
      <select
        value={filters.studentId || ''}
        onChange={(e) => onFiltersChange({ 
          studentId: e.target.value ? parseInt(e.target.value) : null 
        })}
        className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">All Students</option>
        {filteredStudents.map((student) => (
          <option key={student.id} value={student.id}>
            {student.name} (Registry: {student.registro})
          </option>
        ))}
      </select>
    </div>
  )
}
