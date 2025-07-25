// Central registry for all available icons across libraries
import * as LucideIcons from 'lucide-react';
import * as HeroiconsSolid from '@heroicons/react/24/solid';
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as TablerIcons from '@tabler/icons-react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

export type IconComponent = LucideIcon | ComponentType<{ className?: string; size?: number | string }>;

export interface IconDefinition {
  name: string;
  component: IconComponent;
  library: 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor';
  category: 'achievement' | 'academic' | 'reward' | 'general' | 'seasonal' | 'finance';
  tags: string[];
}

// Curated icons for gamification
const ICON_REGISTRY: IconDefinition[] = [
  // Lucide Icons
  { 
    name: 'Trophy', 
    component: LucideIcons.Trophy,
    library: 'lucide',
    category: 'achievement',
    tags: ['award', 'winner', 'champion', 'prize', 'trofeo']
  },
  { 
    name: 'Medal', 
    component: LucideIcons.Medal,
    library: 'lucide',
    category: 'achievement',
    tags: ['award', 'honor', 'medallion', 'medalla']
  },
  { 
    name: 'Crown', 
    component: LucideIcons.Crown,
    library: 'lucide',
    category: 'achievement',
    tags: ['king', 'queen', 'royal', 'corona']
  },
  { 
    name: 'Star', 
    component: LucideIcons.Star,
    library: 'lucide',
    category: 'achievement',
    tags: ['favorite', 'rating', 'estrella']
  },
  { 
    name: 'Award', 
    component: LucideIcons.Award,
    library: 'lucide',
    category: 'achievement',
    tags: ['prize', 'ribbon', 'premio']
  },
  { 
    name: 'Target', 
    component: LucideIcons.Target,
    library: 'lucide',
    category: 'general',
    tags: ['goal', 'aim', 'objective', 'objetivo']
  },
  { 
    name: 'Zap', 
    component: LucideIcons.Zap,
    library: 'lucide',
    category: 'general',
    tags: ['lightning', 'energy', 'power', 'rayo']
  },
  { 
    name: 'Flame', 
    component: LucideIcons.Flame,
    library: 'lucide',
    category: 'general',
    tags: ['fire', 'hot', 'streak', 'fuego']
  },
  { 
    name: 'Shield', 
    component: LucideIcons.Shield,
    library: 'lucide',
    category: 'general',
    tags: ['protection', 'defense', 'escudo']
  },
  { 
    name: 'GraduationCap', 
    component: LucideIcons.GraduationCap,
    library: 'lucide',
    category: 'academic',
    tags: ['education', 'school', 'university', 'graduacion']
  },
  { 
    name: 'BookOpen', 
    component: LucideIcons.BookOpen,
    library: 'lucide',
    category: 'academic',
    tags: ['study', 'read', 'education', 'libro']
  },
  { 
    name: 'Brain', 
    component: LucideIcons.Brain,
    library: 'lucide',
    category: 'academic',
    tags: ['mind', 'intelligence', 'cerebro']
  },
  { 
    name: 'DollarSign', 
    component: LucideIcons.DollarSign,
    library: 'lucide',
    category: 'finance',
    tags: ['money', 'cash', 'currency', 'dinero']
  },
  { 
    name: 'Coins', 
    component: LucideIcons.Coins,
    library: 'lucide',
    category: 'finance',
    tags: ['money', 'currency', 'monedas']
  },
  { 
    name: 'Gem', 
    component: LucideIcons.Gem,
    library: 'lucide',
    category: 'reward',
    tags: ['diamond', 'jewel', 'precious', 'gema']
  },

  // Heroicons Solid
  { 
    name: 'AcademicCapSolid', 
    component: HeroiconsSolid.AcademicCapIcon,
    library: 'heroicons-solid',
    category: 'academic',
    tags: ['graduation', 'education', 'graduacion']
  },
  { 
    name: 'BoltSolid', 
    component: HeroiconsSolid.BoltIcon,
    library: 'heroicons-solid',
    category: 'general',
    tags: ['lightning', 'bolt', 'energy', 'power', 'rayo']
  },
  { 
    name: 'FireSolid', 
    component: HeroiconsSolid.FireIcon,
    library: 'heroicons-solid',
    category: 'general',
    tags: ['flame', 'hot', 'fuego']
  },
  { 
    name: 'SparklesSolid', 
    component: HeroiconsSolid.SparklesIcon,
    library: 'heroicons-solid',
    category: 'reward',
    tags: ['magic', 'shine', 'destellos']
  },

  // Heroicons Outline
  { 
    name: 'StarOutline', 
    component: HeroiconsOutline.StarIcon,
    library: 'heroicons-outline',
    category: 'achievement',
    tags: ['favorite', 'rating', 'estrella']
  },
  { 
    name: 'TrophyOutline', 
    component: HeroiconsOutline.TrophyIcon,
    library: 'heroicons-outline',
    category: 'achievement',
    tags: ['award', 'winner', 'trofeo']
  },

  // Tabler Icons
  { 
    name: 'Certificate', 
    component: TablerIcons.IconCertificate,
    library: 'tabler',
    category: 'academic',
    tags: ['diploma', 'degree', 'certificado']
  },
  { 
    name: 'Crown2', 
    component: TablerIcons.IconCrown,
    library: 'tabler',
    category: 'achievement',
    tags: ['king', 'royal', 'corona']
  },
  { 
    name: 'Coin', 
    component: TablerIcons.IconCoin,
    library: 'tabler',
    category: 'finance',
    tags: ['money', 'currency', 'moneda']
  },
  { 
    name: 'Diamond', 
    component: TablerIcons.IconDiamond,
    library: 'tabler',
    category: 'reward',
    tags: ['gem', 'jewel', 'diamante']
  },

  // Phosphor Icons
  { 
    name: 'TrophyPhosphor', 
    component: PhosphorIcons.Trophy,
    library: 'phosphor',
    category: 'achievement',
    tags: ['award', 'winner', 'trofeo']
  },
  { 
    name: 'MedalPhosphor', 
    component: PhosphorIcons.Medal,
    library: 'phosphor',
    category: 'achievement',
    tags: ['award', 'honor', 'medalla']
  },
  { 
    name: 'RocketLaunch', 
    component: PhosphorIcons.Rocket,
    library: 'phosphor',
    category: 'general',
    tags: ['launch', 'start', 'cohete']
  },
  { 
    name: 'Confetti', 
    component: PhosphorIcons.Confetti,
    library: 'phosphor',
    category: 'reward',
    tags: ['celebration', 'party', 'confeti']
  },

  // Seasonal Icons
  { 
    name: 'Snowflake', 
    component: LucideIcons.Snowflake,
    library: 'lucide',
    category: 'seasonal',
    tags: ['winter', 'christmas', 'snow', 'navidad', 'nieve']
  },
  { 
    name: 'Sun', 
    component: LucideIcons.Sun,
    library: 'lucide',
    category: 'seasonal',
    tags: ['summer', 'hot', 'verano', 'sol']
  },
  { 
    name: 'Gift', 
    component: LucideIcons.Gift,
    library: 'lucide',
    category: 'seasonal',
    tags: ['present', 'birthday', 'regalo', 'cumpleaños']
  },
  { 
    name: 'Heart', 
    component: LucideIcons.Heart,
    library: 'lucide',
    category: 'seasonal',
    tags: ['love', 'valentine', 'amor', 'corazon']
  },
];

// Icon search functionality
export function searchIcons(query: string): IconDefinition[] {
  if (!query) return ICON_REGISTRY;
  
  const lowerQuery = query.toLowerCase();
  return ICON_REGISTRY.filter(icon => 
    icon.name.toLowerCase().includes(lowerQuery) ||
    icon.library.includes(lowerQuery) ||
    icon.tags.some(tag => tag.includes(lowerQuery))
  );
}

// Get icon by name and library
export function getIcon(name: string, library?: string): IconDefinition | undefined {
  return ICON_REGISTRY.find(icon => 
    icon.name === name && (!library || icon.library === library)
  );
}

// Get icons by category
export function getIconsByCategory(category: IconDefinition['category']): IconDefinition[] {
  return ICON_REGISTRY.filter(icon => icon.category === category);
}

// Get all available libraries
export function getAvailableLibraries(): string[] {
  return [...new Set(ICON_REGISTRY.map(icon => icon.library))];
}

export default ICON_REGISTRY;
