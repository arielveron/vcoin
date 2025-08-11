/**
 * Background Jobs Status Component
 * Displays monitoring information for automated achievement processing
 * Extracted from achievements-admin-client.tsx
 */
import { Clock, CheckCircle, AlertCircle, Pause } from 'lucide-react'

interface BackgroundJobStatus {
  daily: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  weekly: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  check: { 
    status: string; 
    lastRun: string | null; 
    lastRunFormatted: string;
    error?: string; 
    lastMessage?: string; 
  };
  lastUpdated: string;
  lastUpdatedFormatted: string;
}

interface BackgroundJobsStatusProps {
  status: BackgroundJobStatus
}

export default function BackgroundJobsStatus({ status }: BackgroundJobsStatusProps) {
  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      case 'not_run': return 'text-gray-600 bg-gray-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (statusType: string) => {
    switch (statusType) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'running': return <Clock className="h-4 w-4" />;
      case 'not_run': return <Pause className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 lg:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Clock className="h-5 w-5 mr-2 text-gray-600" />
        Background Job Status
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Object.entries(status).map(([jobType, jobStatus]) => {
          if (jobType === 'lastUpdated') return null;
          
          return (
            <div key={jobType} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium capitalize">{jobType} Job</h3>
                <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getStatusColor(jobStatus.status)}`}>
                  {getStatusIcon(jobStatus.status)} {jobStatus.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Last Run: {jobStatus.lastRunFormatted}</p>
                {jobStatus.error && (
                  <p className="text-red-600 mt-1">Error: {jobStatus.error}</p>
                )}
                {jobStatus.lastMessage && (
                  <p className="text-gray-500 mt-1 truncate" title={jobStatus.lastMessage}>
                    {jobStatus.lastMessage}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {status.lastUpdatedFormatted}
      </div>
    </div>
  )
}
