/**
 * Students Investment Table Component
 * Table for entering investment amounts per student
 */
'use client'

import { Hash, User, DollarSign, X, RotateCcw } from 'lucide-react'

interface StudentRow {
  student_id: number
  student_name: string
  student_registro: number
  monto: number
  excluded: boolean
}

interface StudentsInvestmentTableProps {
  studentRows: StudentRow[]
  onUpdateAmount: (studentId: number, amount: number) => void
  onToggleExclusion: (studentId: number) => void
}

export function StudentsInvestmentTable({ studentRows, onUpdateAmount, onToggleExclusion }: StudentsInvestmentTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Registry
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Name
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Investment Amount (ARS)
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentRows.map((row) => (
              <tr key={row.student_id} className={`hover:bg-gray-50 ${row.excluded ? 'opacity-50 bg-gray-100' : ''}`}>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {row.student_registro}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className={row.excluded ? 'line-through' : ''}>{row.student_name}</span>
                    {row.excluded && <span className="text-xs text-red-500 font-medium">(Excluded)</span>}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <input
                    type="number"
                    value={row.excluded ? '' : (row.monto || '')}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      onUpdateAmount(row.student_id, value)
                    }}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    disabled={row.excluded}
                    className={`w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      row.excluded ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                  />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onToggleExclusion(row.student_id)}
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                      row.excluded 
                        ? 'text-green-700 bg-green-100 hover:bg-green-200' 
                        : 'text-red-700 bg-red-100 hover:bg-red-200'
                    }`}
                    title={row.excluded ? 'Include student' : 'Exclude student'}
                  >
                    {row.excluded ? (
                      <>
                        <RotateCcw className="h-3 w-3" />
                        Include
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3" />
                        Exclude
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
