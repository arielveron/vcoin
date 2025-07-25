// Dynamic loading for rarely used icon libraries
import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load icon picker to reduce initial bundle
export const DynamicIconPicker = dynamic(
  () => import('@/components/admin/icon-picker'),
  {
    loading: () => React.createElement('div', { className: 'p-4 bg-gray-100 rounded animate-pulse' }, 'Loading icon picker...'),
    ssr: false
  }
);

// Lazy load icon preview for admin only
export const DynamicIconPreview = dynamic(
  () => import('@/components/admin/icon-preview'),
  {
    loading: () => React.createElement('div', { className: 'w-8 h-8 bg-gray-200 rounded animate-pulse' }),
    ssr: false
  }
);

// Lazy load less common icon libraries
export async function loadIconLibrary(library: string) {
  switch(library) {
    case 'tabler':
      return await import('@tabler/icons-react');
    case 'phosphor':
      return await import('@phosphor-icons/react');
    case 'heroicons-solid':
      return await import('@heroicons/react/24/solid');
    case 'heroicons-outline':
      return await import('@heroicons/react/24/outline');
    case 'lucide':
      return await import('lucide-react');
    default:
      throw new Error(`Unknown icon library: ${library}`);
  }
}
