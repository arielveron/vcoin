import { IconDefinition } from '@/lib/icon-registry';

// Client-side icon component cache
const iconComponentCache = new Map<string, IconDefinition>();

export function getCachedIcon(name: string, library: string): IconDefinition | null {
  const key = `${library}:${name}`;
  return iconComponentCache.get(key) || null;
}

export function setCachedIcon(name: string, library: string, icon: IconDefinition): void {
  const key = `${library}:${name}`;
  iconComponentCache.set(key, icon);
}

// Preload commonly used icons
export async function preloadCommonIcons(): Promise<void> {
  const commonIcons = [
    'Trophy', 'Medal', 'Crown', 'Star', 'Award', 'Coins', 'DollarSign'
  ];
  
  // Icons are already loaded through the registry, this is for future optimization
  console.log('Preloading common icons:', commonIcons);
}

// Clear cache if needed
export function clearIconCache(): void {
  iconComponentCache.clear();
}

// Get cache stats
export function getIconCacheStats() {
  return {
    size: iconComponentCache.size,
    keys: Array.from(iconComponentCache.keys())
  };
}
