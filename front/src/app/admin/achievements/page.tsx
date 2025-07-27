import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AdminService } from '@/services/admin-service';
import AchievementsAdminClient from './achievements-admin-client';

export default async function AchievementsAdminPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/admin/auth/signin');
  }

  const adminService = new AdminService();
  
  // Fetch all required data
  const [achievements, students, classes] = await Promise.all([
    adminService.getAllAchievements(),
    adminService.getAllStudents(),
    adminService.getAllClasses()
  ]);

  // Simple background job status (to be enhanced later via API)
  const backgroundJobStatus = {
    daily: { 
      status: 'unknown', 
      lastRun: null, 
      lastRunFormatted: 'Never',
      error: 'Background monitoring available via API' 
    },
    weekly: { 
      status: 'unknown', 
      lastRun: null, 
      lastRunFormatted: 'Never',
      error: 'Background monitoring available via API' 
    },
    check: { 
      status: 'unknown', 
      lastRun: null, 
      lastRunFormatted: 'Never',
      error: 'Background monitoring available via API' 
    },
    lastUpdated: new Date().toISOString(),
    lastUpdatedFormatted: new Date().toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit'
    }) + ', ' + new Date().toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Achievement Management</h1>
        <p className="text-gray-600">Manage achievements, award manual achievements, and view student progress</p>
      </div>
      
      <AchievementsAdminClient 
        achievements={achievements}
        students={students}
        classes={classes}
        backgroundJobStatus={backgroundJobStatus}
      />
    </div>
  );
}
