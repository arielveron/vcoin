'use client';

import { createElement } from 'react';
import { getIcon } from '@/lib/icon-registry';
import { cn } from '@/lib/utils';

interface IconRendererProps {
  name: string;
  library?: string;
  size?: number;
  color?: string;
  className?: string;
  animationClass?: string;
}

export default function IconRenderer({ 
  name, 
  library, 
  size = 24, 
  color,
  className,
  animationClass 
}: IconRendererProps) {
  const iconDef = getIcon(name, library);
  
  if (!iconDef) {
    console.warn(`Icon not found: ${name} from ${library || 'any library'}`);
    return null;
  }

  const iconProps = {
    size,
    className: cn(className, animationClass),
    style: color?.startsWith('#') ? { color } : undefined
  };

  return createElement(iconDef.component, iconProps);
}

// Memoized version for performance
import { memo } from 'react';

export const MemoizedIconRenderer = memo(IconRenderer);
