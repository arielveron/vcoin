/**
 * Investment Filters Component
 * Handles filtering of investments by class, student, date, category, and text search
 */
'use client'

import { Search } from 'lucide-react'
import type { Class, Student, InvestmentCategory } from '@/types/database'

interface AdminFilters {
  classId: number | null
  studentId: number | null
  categoryId: number | null
  date: string | null
  searchText: string | null
}

interface InvestmentFiltersProps {
  classes: Class[]
  students: Student[]
  categories: InvestmentCategory[]
  filters: AdminFilters
  onFiltersChange: (filters: Partial<AdminFilters>) => void
  className?: string
}

export default function InvestmentFilters({
  classes,
  students,
  categories,
  filters,
  onFiltersChange,
  className = ""
}: InvestmentFiltersProps) {
  // Filter students by class if a class filter is active
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Text Filter - Separate line */}
      <div className="w-full relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.searchText || ''}
          onChange={(e) => onFiltersChange({ 
            searchText: e.target.value || null 
          })}
          placeholder="Search by concept..."
          className="w-full pl-10 pr-3 py-2 rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      {/* Other Filters - Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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

      {/* Category Filter */}
      <select
        value={filters.categoryId || ''}
        onChange={(e) => onFiltersChange({ 
          categoryId: e.target.value ? parseInt(e.target.value) : null 
        })}
        className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>

      {/* Date Filter */}
      <input
        type="date"
        value={filters.date || ''}
        onChange={(e) => onFiltersChange({ 
          date: e.target.value || null 
        })}
        placeholder="Filter by date"
        className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
      />
      </div>
    </div>
  )
}
