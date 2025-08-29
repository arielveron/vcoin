/**
 * GroupsTable Component
 * Table component for displaying groups with actions
 */
'use client'

import { Users, Edit, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import type { GroupWithDetailsForClient } from '@/utils/admin-data-types'

interface GroupsTableProps {
  groups: GroupWithDetailsForClient[]
  onEdit?: (group: GroupWithDetailsForClient) => void
  onDelete?: (groupId: number) => void
  onToggleStatus?: (groupId: number) => void
  onManageStudents?: (group: GroupWithDetailsForClient) => void
  loading?: boolean
}

export default function GroupsTable({
  groups,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageStudents,
  loading = false
}: GroupsTableProps) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading groups...</p>
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new group.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Group
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Students
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg VCoins
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Points
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {groups.map((group, index) => (
            <tr key={`group-${group.id}-${group.is_enabled}-${index}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    #{group.group_number} - {group.name}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {group.class_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {group.student_count}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {group.calculated_average_vcoin_amount_formatted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {group.calculated_average_achievement_points_formatted}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  group.is_enabled 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {group.is_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(group)}
                    className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                    title="Edit group"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                )}
                
                {onManageStudents && (
                  <button
                    onClick={() => onManageStudents(group)}
                    className="text-green-600 hover:text-green-900 inline-flex items-center"
                    title="Manage students"
                  >
                    <Users className="h-4 w-4" />
                  </button>
                )}
                
                {onToggleStatus && (
                  <button
                    onClick={() => onToggleStatus(group.id)}
                    className={`${
                      group.is_enabled 
                        ? 'text-orange-600 hover:text-orange-900' 
                        : 'text-green-600 hover:text-green-900'
                    } inline-flex items-center`}
                    title={group.is_enabled ? 'Disable group' : 'Enable group'}
                  >
                    {group.is_enabled ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                {onDelete && (
                  <button
                    onClick={() => onDelete(group.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                    title="Delete group"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
