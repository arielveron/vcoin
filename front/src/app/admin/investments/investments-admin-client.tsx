'use client'

import InvestmentsPage from '@/presentation/features/admin/investments/InvestmentsPage'
import type { InvestmentForClient, StudentForClient, ClassForClient } from '@/utils/admin-data-types'
import type { InvestmentCategory } from '@/types/database'
import type { InvestmentAdminActions } from '@/utils/admin-server-action-types'

interface InvestmentsAdminClientProps {
  initialInvestments: InvestmentForClient[]
  students: StudentForClient[]
  classes: ClassForClient[]
  categories: InvestmentCategory[]
  createInvestment: InvestmentAdminActions['createInvestment']
  updateInvestment: InvestmentAdminActions['updateInvestment'] 
  deleteInvestment: InvestmentAdminActions['deleteInvestment']
  createBatchInvestments: InvestmentAdminActions['createBatchInvestments']
  getStudentsForBatch: InvestmentAdminActions['getStudentsForBatch']
}

export default function InvestmentsAdminClient(props: InvestmentsAdminClientProps) {
  return <InvestmentsPage {...props} />
}
