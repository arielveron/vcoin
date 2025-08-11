import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { Suspense } from 'react'
import InterestRatesPage from '@/presentation/features/admin/interest-rates/InterestRatesPage'
import { createInterestRate, updateInterestRate, deleteInterestRate } from './actions'
import { formatInterestRateForClient } from '@/utils/admin-data-types'

export default async function InterestRatesAdminPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const { rates: interestRates, currentRates } = await adminService.getAllInterestRatesWithCurrentRates()
  const classes = await adminService.getAllClasses()

  // Transform rates to client format
  const initialRates = interestRates.map(formatInterestRateForClient)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Interest Rates Management</h1>
        <p className="mt-2 text-gray-600">
          Set and manage monthly interest rate history for each class.
        </p>
      </div>
      
      <Suspense fallback={<div>Loading interest rates...</div>}>
        <InterestRatesPage 
          initialRates={initialRates}
          classes={classes} 
          currentRates={currentRates}
          createInterestRate={createInterestRate}
          updateInterestRate={updateInterestRate}
          deleteInterestRate={deleteInterestRate}
        />
      </Suspense>
    </div>
  )
}
