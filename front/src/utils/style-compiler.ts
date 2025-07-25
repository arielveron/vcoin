import { InvestmentCategory } from '@/types/database';

// Cache compiled styles to avoid repeated processing
const styleCache = new Map<string, { className: string; style: React.CSSProperties }>();

export function compileInvestmentStyle(category: InvestmentCategory | null | undefined): {
  className: string;
  style: React.CSSProperties;
} {
  if (!category) {
    return { className: 'text-gray-700', style: {} };
  }

  const cacheKey = `${category.id}-${JSON.stringify(category.text_style)}`;
  
  if (styleCache.has(cacheKey)) {
    return styleCache.get(cacheKey)!;
  }

  const { text_style } = category;
  
  const className = [
    text_style.fontSize || 'text-sm',
    text_style.fontWeight || 'font-normal',
    text_style.fontStyle || '',
    text_style.textColor || 'text-gray-900',
    text_style.effectClass || ''
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = text_style.customCSS ? 
    Object.fromEntries(
      text_style.customCSS.split(';')
        .filter(rule => rule.trim())
        .map(rule => {
          const [key, value] = rule.split(':').map(s => s.trim());
          return [key, value];
        })
    ) : {};

  const compiled = { className, style };
  styleCache.set(cacheKey, compiled);
  
  return compiled;
}

// Clear cache if needed (e.g., when categories are updated)
export function clearStyleCache() {
  styleCache.clear();
}
