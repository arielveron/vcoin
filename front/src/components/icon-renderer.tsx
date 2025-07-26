'use client';

import { createElement } from 'react';
import { getIcon } from '@/lib/icon-registry';
import { cn } from '@/lib/utils';

interface IconRendererProps {
  name: string;
  library?: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  className?: string;
  animationClass?: string;
}

export default function IconRenderer({ 
  name, 
  library, 
  size = 24, 
  color,
  backgroundColor,
  padding = 4,
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

  const iconElement = createElement(iconDef.component, iconProps);

  // If background color is specified, wrap the icon
  if (backgroundColor) {
    return (
      <div
        className={cn("inline-flex items-center justify-center rounded", className)}
        style={{
          backgroundColor,
          padding: `${padding}px`,
          minWidth: size + (padding * 2),
          minHeight: size + (padding * 2)
        }}
      >
        {iconElement}
      </div>
    );
  }

  return iconElement;
}

// Memoized version for performance
import { memo } from 'react';

export const MemoizedIconRenderer = memo(IconRenderer);
