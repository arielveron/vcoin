/**
 * Investments Table Component
 * Displays investments in a responsive table format
 */
'use client'

import { Calendar, DollarSign, User, Tag, Edit, Trash2 } from 'lucide-react'
import ResponsiveTable from '@/components/admin/responsive-table'
import IconRenderer from '@/components/icon-renderer'
import type { InvestmentCategory } from '@/types/database'

interface InvestmentWithFormatting {
  id: number
  student_id: number
  student_name: string
  student_registro: string
  fecha_formatted: string
  monto_formatted: string
  concepto: string
  category_id?: number
  category?: InvestmentCategory
}

interface InvestmentsTableProps {
  investments: InvestmentWithFormatting[]
  onEdit: (investment: InvestmentWithFormatting) => void
  onDelete: (id: number) => void
}

export default function InvestmentsTable({
  investments,
  onEdit,
  onDelete
}: InvestmentsTableProps) {
  const columns = [
    { 
      key: 'student_name', 
      header: 'Student', 
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <div className="font-medium">{item.student_name}</div>
            <div className="text-sm text-gray-500">Registry: {item.student_registro}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'fecha_formatted', 
      header: 'Date', 
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-nowrap">{item.fecha_formatted}</span>
        </div>
      )
    },
    { 
      key: 'monto_formatted', 
      header: 'Amount', 
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center justify-end space-x-2">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="text-right text-nowrap font-bold">{item.monto_formatted}</span>
        </div>
      )
    },
    { 
      key: 'concepto', 
      header: 'Concept',
      render: (item: InvestmentWithFormatting) => (
        <span className="max-w-xs truncate block">{item.concepto}</span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (item: InvestmentWithFormatting) => {
        if (!item.category) {
          return (
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400 text-sm">Standard</span>
            </div>
          )
        }
        
        return (
          <div className="flex items-center space-x-2">
            <Tag className="h-4 w-4 text-gray-400" />
            {item.category.icon_config && (
              <IconRenderer 
                name={item.category.icon_config.name}
                library={item.category.icon_config.library}
                size={16}
                color={item.category.icon_config.color}
                backgroundColor={item.category.icon_config.backgroundColor}
                animationClass={item.category.icon_config.animationClass}
                effectClass={item.category.icon_config.effectClass}
              />
            )}
            <div>
              <div className="font-medium text-sm">{item.category.name}</div>
              <div className="text-xs text-gray-500">{item.category.level}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: InvestmentWithFormatting) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(item)}
            className="text-indigo-600 hover:text-indigo-900 p-1"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this investment?')) {
                onDelete(item.id)
              }
            }}
            className="text-red-600 hover:text-red-900 p-1"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  return (
    <ResponsiveTable
      data={investments}
      columns={columns}
    />
  )
}
