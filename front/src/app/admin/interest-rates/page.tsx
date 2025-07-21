import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import InterestRatesAdminClient from './interest-rates-admin-client'

export default async function InterestRatesAdminPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const { rates: interestRates, currentRates } = await adminService.getAllInterestRatesWithCurrentRates()
  const classes = await adminService.getAllClasses()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Interest Rates Management</h1>
        <p className="mt-2 text-gray-600">
          Set and manage monthly interest rate history for each class.
        </p>
      </div>
      
      <InterestRatesAdminClient interestRates={interestRates} classes={classes} currentRates={currentRates} />
    </div>
  )
}
