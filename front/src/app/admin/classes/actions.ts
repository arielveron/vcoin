'use server'

import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect('/admin/auth/signin')
  }
  return session
}

export async function createClass(formData: FormData) {
  await requireAuth()
  
  const adminService = new AdminService()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const end_date = new Date(formData.get('end_date') as string)
  const timezone = formData.get('timezone') as string

  try {
    await adminService.createClass({
      name,
      description,
      end_date,
      timezone
    })
    
    revalidatePath('/admin/classes')
  } catch (error) {
    console.error('Error creating class:', error)
    throw new Error('Failed to create class')
  }
}

export async function updateClass(formData: FormData) {
  await requireAuth()
  
  const adminService = new AdminService()
  
  const id = parseInt(formData.get('id') as string)
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const end_date = new Date(formData.get('end_date') as string)
  const timezone = formData.get('timezone') as string

  try {
    await adminService.updateClass(id, {
      name,
      description,
      end_date,
      timezone
    })
    
    revalidatePath('/admin/classes')
  } catch (error) {
    console.error('Error updating class:', error)
    throw new Error('Failed to update class')
  }
}

export async function deleteClass(formData: FormData) {
  await requireAuth()
  
  const adminService = new AdminService()
  
  const id = parseInt(formData.get('id') as string)

  try {
    await adminService.deleteClass(id)
    
    revalidatePath('/admin/classes')
  } catch (error) {
    console.error('Error deleting class:', error)
    throw new Error('Failed to delete class')
  }
}
