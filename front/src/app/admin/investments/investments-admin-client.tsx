'use client'

import { useState } from 'react'
import { InvestmentWithStudent, Student, InvestmentCategory } from '@/types/database'
import { createInvestment, updateInvestment, deleteInvestment } from './actions'
import { useAdminFilters } from '@/hooks/useAdminFilters'
import FilterBadges from '@/app/admin/components/filter-badges'
import ResponsiveTable from '@/components/admin/responsive-table'
import MobileFilters from '@/components/admin/mobile-filters'
import { formatCurrency } from '@/utils/format'
import { WithFormattedDates } from '@/utils/format-dates'
import IconRenderer from '@/components/icon-renderer'
import { Calendar, DollarSign, User, Tag, Edit, Trash2, Plus, X, TrendingUp, BarChart3 } from 'lucide-react'

// Client-side types with formatted data
type InvestmentForClient = WithFormattedDates<InvestmentWithStudent, 'fecha' | 'created_at' | 'updated_at'> & {
  monto_formatted: string
}
type StudentForClient = WithFormattedDates<Student, 'created_at' | 'updated_at'>
type ClassForClient = WithFormattedDates<{ 
  id: number; 
  name: string; 
  description?: string;
  end_date: Date; 
  timezone: string;
  current_monthly_interest_rate?: number;
  created_at: Date; 
  updated_at: Date 
}, 'end_date' | 'created_at' | 'updated_at'>

interface InvestmentsAdminClientProps {
  investments: InvestmentForClient[]
  students: StudentForClient[]
  classes: ClassForClient[]
  categories: InvestmentCategory[]
}

export default function InvestmentsAdminClient({ investments: initialInvestments, students, classes, categories }: InvestmentsAdminClientProps) {
  const [investments, setInvestments] = useState(initialInvestments)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<InvestmentForClient | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { filters, updateFilters } = useAdminFilters()

  const handleCreateInvestment = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createInvestment(formData)
      
      if (result.success && result.data) {
        setShowCreateForm(false)
        // Refresh the investments list - in a real app you'd want to properly update with student info
        window.location.reload()
      } else if (!result.success) {
        alert(result.error || 'Failed to create investment')
      }
    } catch (error) {
      console.error('Create investment error:', error)
      alert('Failed to create investment: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateInvestment = async (formData: FormData) => {
    if (!editingInvestment) return
    
    try {
      const result = await updateInvestment(editingInvestment.id, formData)
      if (result.success) {
        // Refresh the investments list
        window.location.reload()
      } else if (!result.success) {
        alert(result.error || 'Failed to update investment')
      }
    } catch {
      alert('Failed to update investment')
    }
  }

  const handleDeleteInvestment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this investment?')) return
    
    try {
      const result = await deleteInvestment(id)
      if (result.success) {
        setInvestments(investments.filter(inv => inv.id !== id))
      } else if (!result.success) {
        alert(result.error || 'Failed to delete investment')
      }
    } catch {
      alert('Failed to delete investment')
    }
  }

  // Filter investments based on current filters
  const filteredInvestments = investments.filter(investment => {
    if (filters.classId) {
      const student = students.find(s => s.id === investment.student_id)
      if (!student || student.class_id !== filters.classId) return false
    }
    if (filters.studentId && investment.student_id !== filters.studentId) return false
    return true
  })

  // Filter students based on selected class
  const filteredStudents = filters.classId 
    ? students.filter(student => student.class_id === filters.classId)
    : students

  // Define columns for ResponsiveTable
  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (investment: InvestmentForClient) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{investment.student_name}</div>
            <div className="text-sm text-gray-500">{investment.class_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'fecha',
      header: 'Date',
      render: (investment: InvestmentForClient) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{investment.fecha_formatted}</span>
        </div>
      )
    },
    {
      key: 'monto',
      header: 'Amount',
      render: (investment: InvestmentForClient) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="font-medium text-green-600">{investment.monto_formatted}</span>
        </div>
      )
    },
    {
      key: 'concepto',
      header: 'Concept',
      hideOnMobile: true,
      render: (investment: InvestmentForClient) => investment.concepto
    },
    {
      key: 'category',
      header: 'Category',
      render: (investment: InvestmentForClient) => {
        const category = investment.category;
        
        // Build className from category text style (excluding textColor which will be handled inline)
        const categoryClasses = category?.text_style
          ? [
              category.text_style.fontSize || "",
              category.text_style.fontWeight || "",
              category.text_style.fontStyle || "",
              category.text_style.effectClass || "",
            ]
              .filter(Boolean)
              .join(" ")
          : "";
        
        // Build inline styles from customCSS and textColor
        const inlineStyles = {
          // First apply customCSS if it exists
          ...(category?.text_style?.customCSS
            ? Object.fromEntries(
                category.text_style.customCSS
                  .split(";")
                  .filter((rule) => rule.trim())
                  .map((rule) => {
                    const [key, value] = rule.split(":").map((s) => s.trim());
                    return [key, value];
                  })
              )
            : {}),
          // Then apply textColor if it exists (this will override any color from customCSS)
          ...(category?.text_style?.textColor?.startsWith('#') 
            ? { color: category.text_style.textColor }
            : {})
        };

        return (
          <div>
            {category ? (
              <div className="flex items-center gap-2">
                <span 
                  className={`text-sm ${categoryClasses || 'text-gray-900'}`}
                  style={inlineStyles}
                >
                  {category.name}
                </span>
                {category.icon_config?.name && (
                  <IconRenderer 
                    name={category.icon_config.name}
                    library={category.icon_config.library}
                    size={16}
                    color={category.icon_config.color}
                    effectClass={category.icon_config.effectClass}
                    backgroundColor={category.icon_config.backgroundColor}
                    padding={category.icon_config.padding}
                  />
                )}
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {category.level}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Standard</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (investment: InvestmentForClient) => (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingInvestment(investment)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            aria-label="Edit investment"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteInvestment(investment.id)}
            className="text-red-600 hover:text-red-900 p-1"
            aria-label="Delete investment"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  // Custom mobile card
  const mobileCard = (investment: InvestmentForClient) => (
    <div>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{investment.student_name}</h3>
            <p className="text-sm text-gray-500">{investment.class_name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setEditingInvestment(investment)}
            className="text-indigo-600 p-1"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteInvestment(investment.id)}
            className="text-red-600 p-1"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <span className="text-xl font-bold text-green-600">{investment.monto_formatted}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{investment.fecha_formatted}</span>
        </div>
      </div>
      
      <div className="text-sm text-gray-700 mb-2">
        <strong>Concept:</strong> {investment.concepto}
      </div>
      
      <div>
        {investment.category ? (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span 
              className={`text-sm ${
                investment.category.text_style
                  ? [
                      investment.category.text_style.fontSize || "",
                      investment.category.text_style.fontWeight || "",
                      investment.category.text_style.fontStyle || "",
                      investment.category.text_style.effectClass || "",
                    ]
                      .filter(Boolean)
                      .join(" ") || 'text-gray-900'
                  : 'text-gray-900'
              }`}
              style={{
                // First apply customCSS if it exists
                ...(investment.category.text_style?.customCSS
                  ? Object.fromEntries(
                      investment.category.text_style.customCSS
                        .split(";")
                        .filter((rule) => rule.trim())
                        .map((rule) => {
                          const [key, value] = rule.split(":").map((s) => s.trim());
                          return [key, value];
                        })
                    )
                  : {}),
                // Then apply textColor if it exists (this will override any color from customCSS)
                ...(investment.category.text_style?.textColor?.startsWith('#') 
                  ? { color: investment.category.text_style.textColor }
                  : {})
              }}
            >
              {investment.category.name}
            </span>
            {investment.category.icon_config?.name && (
              <IconRenderer 
                name={investment.category.icon_config.name}
                library={investment.category.icon_config.library}
                size={16}
                color={investment.category.icon_config.color}
                effectClass={investment.category.icon_config.effectClass}
                backgroundColor={investment.category.icon_config.backgroundColor}
                padding={investment.category.icon_config.padding}
              />
            )}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {investment.category.level}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-gray-400">Standard</span>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <FilterBadges classes={classes} students={students} />

      {/* Summary Stats - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Investments</h3>
              <p className="text-2xl lg:text-3xl font-bold text-blue-600">{filteredInvestments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
              <p className="text-2xl lg:text-3xl font-bold text-green-600">{formatCurrency(filteredInvestments.reduce((sum, inv) => sum + inv.monto, 0))}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 lg:p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Investment</h3>
              <p className="text-2xl lg:text-3xl font-bold text-purple-600">
                {filteredInvestments.length > 0 ? formatCurrency(filteredInvestments.reduce((sum, inv) => sum + inv.monto, 0) / filteredInvestments.length) : '$0,00'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Controls - Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">All Investments</h2>
          <p className="text-gray-600">Total: {filteredInvestments.length} investments</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Desktop Filters - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-3">
            <select
              value={filters.classId || ''}
              onChange={(e) => updateFilters({ classId: e.target.value ? parseInt(e.target.value) : null })}
              className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            
            <select
              value={filters.studentId || ''}
              onChange={(e) => updateFilters({ studentId: e.target.value ? parseInt(e.target.value) : null })}
              className="rounded-md border-gray-300 text-sm py-2 px-3 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Students</option>
              {filteredStudents.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.registro} - {student.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Mobile Filters - Shown on mobile */}
          <div className="lg:hidden">
            <MobileFilters
              classes={classes}
              students={filteredStudents}
              currentClassId={filters.classId}
              currentStudentId={filters.studentId}
              onClassChange={(classId) => updateFilters({ classId })}
              onStudentChange={(studentId) => updateFilters({ studentId })}
              onClearFilters={() => updateFilters({ classId: null })}
              showStudentFilter={true}
            />
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Investment
          </button>
        </div>
      </div>

      {/* Create Form - Mobile-friendly */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-medium text-gray-900">Create New Investment</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form 
                key={`create-${filters.studentId || 'all'}`} 
                action={handleCreateInvestment} 
                className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                      Student
                    </label>
                    <select
                      id="student_id"
                      name="student_id"
                      required
                      defaultValue={filters.studentId ? filters.studentId.toString() : ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      <option value="">Select a student</option>
                      {filteredStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} (Registry: {student.registro})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      required
                      defaultValue={new Date().toLocaleDateString('en-CA')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="monto"
                      name="monto"
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="concepto" className="block text-sm font-medium text-gray-700">
                      Concept
                    </label>
                    <input
                      type="text"
                      id="concepto"
                      name="concepto"
                      required
                      maxLength={255}
                      placeholder="e.g., Final exam, Homework assignment"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="category_id"
                      name="category_id"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      <option value="">Standard</option>
                      {categories
                        .filter(cat => cat.is_active)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.level})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Investment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form - Mobile-friendly */}
      {editingInvestment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-0 lg:top-10 mx-auto p-0 lg:p-5 border w-full lg:w-2xl h-full lg:h-auto shadow-lg lg:rounded-md bg-white">
            <div className="flex flex-col h-full lg:h-auto">
              <div className="flex items-center justify-between p-4 border-b lg:border-0">
                <h3 className="text-lg font-medium text-gray-900">Edit Investment</h3>
                <button
                  onClick={() => setEditingInvestment(null)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form 
                action={handleUpdateInvestment} 
                className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-4"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="edit-student_id" className="block text-sm font-medium text-gray-700">
                      Student
                    </label>
                    <select
                      id="edit-student_id"
                      name="student_id"
                      defaultValue={editingInvestment.student_id}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} (Registry: {student.registro})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="edit-fecha" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="edit-fecha"
                      name="fecha"
                      defaultValue={new Date(editingInvestment.fecha).toISOString().split('T')[0]}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-monto" className="block text-sm font-medium text-gray-700">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="edit-monto"
                      name="monto"
                      defaultValue={editingInvestment.monto}
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-concepto" className="block text-sm font-medium text-gray-700">
                      Concept
                    </label>
                    <input
                      type="text"
                      id="edit-concepto"
                      name="concepto"
                      defaultValue={editingInvestment.concepto}
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <label htmlFor="edit-category_id" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="edit-category_id"
                      name="category_id"
                      defaultValue={editingInvestment.category_id || ''}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-3 lg:py-2"
                    >
                      <option value="">Standard</option>
                      {categories
                        .filter(cat => cat.is_active)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name} ({category.level})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col-reverse lg:flex-row gap-2 pt-4 border-t lg:border-0">
                  <button
                    type="button"
                    onClick={() => setEditingInvestment(null)}
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full lg:w-auto px-4 py-3 lg:py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Update Investment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Investments Table */}
      <ResponsiveTable
        data={filteredInvestments}
        columns={columns}
        mobileCard={mobileCard}
        emptyMessage="No investments found. Create your first investment above."
      />
    </div>
  )
}
