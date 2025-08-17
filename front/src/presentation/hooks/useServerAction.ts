/**
 * Reusable hook for handling server actions
 * Provides loading state, error handling, and success callbacks
 * Based on the pattern mentioned in the refactoring guide
 */

'use client'

import { useState } from 'react';

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseServerActionOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

export function useServerAction<T, R>(
  action: (data: T) => Promise<ActionResult<R>>,
  options: UseServerActionOptions<R> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (data: T): Promise<ActionResult<R>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await action(data);
      
      if (result.success && result.data) {
        options.onSuccess?.(result.data);
      } else if (!result.success && result.error) {
        setError(result.error);
        options.onError?.(result.error);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    execute,
    loading,
    error,
    clearError
  };
}
