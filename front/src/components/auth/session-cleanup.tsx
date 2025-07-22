'use client';

import { useEffect } from 'react';
import { clearInvalidSession } from '@/actions/student-actions';

interface SessionCleanupProps {
  hasInvalidSession: boolean;
}

export default function SessionCleanup({ hasInvalidSession }: SessionCleanupProps) {
  useEffect(() => {
    if (hasInvalidSession) {
      console.log('🧹 Clearing invalid session data...');
      clearInvalidSession().catch(console.error);
    }
  }, [hasInvalidSession]);

  return null; // This component doesn't render anything
}
