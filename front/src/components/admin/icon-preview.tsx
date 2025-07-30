'use client';

import { useState, useEffect } from 'react';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';

interface IconPreviewProps {
  name?: string;
  library?: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  padding?: number;
  animationClass?: string;
  effectClass?: string;
  showLabel?: boolean;
  className?: string;
}

export default function IconPreview({
  name,
  library,
  size = 32,
  color,
  backgroundColor,
  padding,
  animationClass,
  effectClass,
  showLabel = true,
  className
}: IconPreviewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !name) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4 bg-gray-100 rounded", className)}>
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
        {showLabel && <span className="text-xs text-gray-500 mt-1">No icon</span>}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-4", className)}>
      <IconRenderer
        name={name}
        library={library}
        size={size}
        color={color}
        backgroundColor={backgroundColor}
        padding={padding}
        animationClass={animationClass}
        effectClass={effectClass}
      />
      {showLabel && (
        <span className="text-xs text-gray-600 mt-1">
          {name} ({library})
        </span>
      )}
    </div>
  );
}
