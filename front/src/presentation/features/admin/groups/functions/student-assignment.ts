/**
 * Student Assignment Functions
 * Handles assigning and removing students from groups
 */
import type { GroupWithDetailsForClient, StudentForClient } from '@/utils/admin-data-types'

export type StudentAssignmentHandlers = {
  handleAssignStudent: (studentId: number, groupId: number) => Promise<void>
  handleRemoveStudent: (studentId: number) => Promise<void>
}

export function createStudentAssignmentHandlers(
  groups: GroupWithDetailsForClient[],
  setGroups: (groups: GroupWithDetailsForClient[]) => void,
  localStudents: StudentForClient[],
  setLocalStudents: (students: StudentForClient[]) => void,
  studentModalGroup: GroupWithDetailsForClient | null,
  executeAssign: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>,
  executeRemove: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>
): StudentAssignmentHandlers {

  const handleAssignStudent = async (studentId: number, groupId: number) => {
    // Create FormData for addStudentsToGroup action
    const formData = new FormData()
    formData.append('groupId', groupId.toString())
    formData.append('studentIds', studentId.toString()) // Single student ID

    const result = await executeAssign(formData)
    if (result.success && result.data) {
      // Update local students state to reflect the assignment
      setLocalStudents(localStudents.map(s => 
        s.id === studentId 
          ? { ...s, group_id: groupId, group_name: studentModalGroup?.name }
          : s
      ))
      
      // Update groups state to reflect new student count
      setGroups(groups.map(g => 
        g.id === groupId 
          ? { ...g, student_count: g.student_count + 1 }
          : g
      ))
      
      alert('Student assigned successfully!')
    } else {
      alert(result.error || 'Failed to assign student')
    }
  }

  const handleRemoveStudent = async (studentId: number) => {
    // Create FormData for removeStudentsFromGroup action
    const formData = new FormData()
    formData.append('studentIds', studentId.toString()) // Single student ID

    const result = await executeRemove(formData)
    if (result.success && result.data) {
      // Update local students state to reflect the removal
      setLocalStudents(localStudents.map(s => 
        s.id === studentId 
          ? { ...s, group_id: null, group_name: null }
          : s
      ))
      
      // Update groups state to reflect reduced student count
      if (studentModalGroup) {
        setGroups(groups.map(g => 
          g.id === studentModalGroup.id 
            ? { ...g, student_count: g.student_count - 1 }
            : g
        ))
      }
      
      alert('Student removed successfully!')
    } else {
      alert(result.error || 'Failed to remove student')
    }
  }

  return {
    handleAssignStudent,
    handleRemoveStudent
  }
}
