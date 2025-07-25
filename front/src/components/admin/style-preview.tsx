'use client';

import { InvestmentCategory } from '@/types/database';

interface StylePreviewProps {
  category: Partial<InvestmentCategory>;
  text?: string;
  showEffectName?: boolean;
}

export default function StylePreview({ 
  category, 
  text = "Investment Preview", 
  showEffectName = false 
}: StylePreviewProps) {
  const { text_style = {} } = category;
  
  // Build className from text_style
  const classNames = [
    text_style.fontSize || 'text-sm',
    text_style.fontWeight || 'font-normal',
    text_style.fontStyle || '',
    text_style.textColor || 'text-gray-900',
    text_style.effectClass || ''
  ].filter(Boolean).join(' ');

  // Build inline styles from customCSS
  const inlineStyles = text_style.customCSS ? 
    Object.fromEntries(
      text_style.customCSS.split(';')
        .filter(rule => rule.trim())
        .map(rule => {
          const [key, value] = rule.split(':').map(s => s.trim());
          return [key, value];
        })
    ) : {};

  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <div className="text-center">
        <span 
          className={classNames}
          style={inlineStyles}
        >
          {text}
        </span>
      </div>
      {showEffectName && text_style.effectClass && (
        <div className="mt-1 text-xs text-gray-500 text-center">
          Effect: {text_style.effectClass}
        </div>
      )}
    </div>
  );
}
