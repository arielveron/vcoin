// Central registry for all available icons across libraries
import {
  Trophy,
  Medal,
  Crown,
  Star,
  Award,
  Target,
  Zap,
  Flame,
  Shield,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Book,
  Bookmark,
  Lightbulb,
  Brain,
  Calculator,
  PenTool,
  DollarSign,
  Coins,
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  BarChart3,
  Gem,
  Gift,
  Sparkles,
  Heart,
  ThumbsUp,
  Snowflake,
  Sun,
  TreePine,
  Candy,
  type LucideIcon
} from 'lucide-react';
import * as HeroiconsSolid from '@heroicons/react/24/solid';
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as TablerIcons from '@tabler/icons-react';
import * as PhosphorIcons from '@phosphor-icons/react';
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
  // Lucide Icons - Solid variants preferred
  { 
    name: 'Trophy', 
    component: Trophy,
    library: 'lucide',
    category: 'achievement',
    tags: ['award', 'winner', 'champion', 'prize', 'trofeo']
  },
  { 
    name: 'Medal', 
    component: Medal,
    library: 'lucide',
    category: 'achievement',
    tags: ['award', 'honor', 'medallion', 'medalla']
  },
  { 
    name: 'Crown', 
    component: Crown,
    library: 'lucide',
    category: 'achievement',
    tags: ['king', 'queen', 'royal', 'corona']
  },
  { 
    name: 'Star', 
    component: Star,
    library: 'lucide',
    category: 'achievement',
    tags: ['favorite', 'rating', 'estrella']
  },
  { 
    name: 'Award', 
    component: Award,
    library: 'lucide',
    category: 'achievement',
    tags: ['prize', 'ribbon', 'premio']
  },
  { 
    name: 'Target', 
    component: Target,
    library: 'lucide',
    category: 'general',
    tags: ['goal', 'aim', 'objective', 'objetivo']
  },
  { 
    name: 'Zap', 
    component: Zap,
    library: 'lucide',
    category: 'general',
    tags: ['lightning', 'energy', 'power', 'rayo']
  },
  { 
    name: 'Flame', 
    component: Flame,
    library: 'lucide',
    category: 'general',
    tags: ['fire', 'hot', 'streak', 'fuego']
  },
  { 
    name: 'Shield', 
    component: Shield,
    library: 'lucide',
    category: 'general',
    tags: ['protection', 'defense', 'escudo']
  },
  { 
    name: 'ShieldCheck', 
    component: ShieldCheck,
    library: 'lucide',
    category: 'general',
    tags: ['protection', 'verified', 'defense', 'escudo']
  },
  { 
    name: 'GraduationCap', 
    component: GraduationCap,
    library: 'lucide',
    category: 'academic',
    tags: ['education', 'school', 'university', 'graduacion']
  },
  { 
    name: 'BookOpen', 
    component: BookOpen,
    library: 'lucide',
    category: 'academic',
    tags: ['study', 'read', 'education', 'libro']
  },
  { 
    name: 'Book', 
    component: Book,
    library: 'lucide',
    category: 'academic',
    tags: ['study', 'read', 'education', 'libro']
  },
  { 
    name: 'Bookmark', 
    component: Bookmark,
    library: 'lucide',
    category: 'academic',
    tags: ['save', 'favorite', 'marcador']
  },
  { 
    name: 'Lightbulb', 
    component: Lightbulb,
    library: 'lucide',
    category: 'academic',
    tags: ['idea', 'innovation', 'creativity', 'bombilla']
  },
  { 
    name: 'Brain', 
    component: Brain,
    library: 'lucide',
    category: 'academic',
    tags: ['mind', 'intelligence', 'cerebro']
  },
  { 
    name: 'Calculator', 
    component: Calculator,
    library: 'lucide',
    category: 'academic',
    tags: ['math', 'calculation', 'calculadora']
  },
  { 
    name: 'PenTool', 
    component: PenTool,
    library: 'lucide',
    category: 'academic',
    tags: ['write', 'draw', 'design', 'lapiz']
  },
  { 
    name: 'DollarSign', 
    component: DollarSign,
    library: 'lucide',
    category: 'finance',
    tags: ['money', 'cash', 'currency', 'dinero']
  },
  { 
    name: 'Coins', 
    component: Coins,
    library: 'lucide',
    category: 'finance',
    tags: ['money', 'currency', 'monedas']
  },
  { 
    name: 'Wallet', 
    component: Wallet,
    library: 'lucide',
    category: 'finance',
    tags: ['money', 'billfold', 'billetera']
  },
  { 
    name: 'CreditCard', 
    component: CreditCard,
    library: 'lucide',
    category: 'finance',
    tags: ['payment', 'card', 'tarjeta']
  },
  { 
    name: 'PiggyBank', 
    component: PiggyBank,
    library: 'lucide',
    category: 'finance',
    tags: ['savings', 'money', 'alcancia']
  },
  { 
    name: 'TrendingUp', 
    component: TrendingUp,
    library: 'lucide',
    category: 'finance',
    tags: ['growth', 'profit', 'increase', 'crecimiento']
  },
  { 
    name: 'BarChart3', 
    component: BarChart3,
    library: 'lucide',
    category: 'finance',
    tags: ['analytics', 'stats', 'data', 'grafico']
  },
  { 
    name: 'Gem', 
    component: Gem,
    library: 'lucide',
    category: 'reward',
    tags: ['diamond', 'jewel', 'precious', 'gema']
  },
  { 
    name: 'Gift', 
    component: Gift,
    library: 'lucide',
    category: 'reward',
    tags: ['present', 'birthday', 'regalo', 'cumpleaños']
  },
  { 
    name: 'Sparkles', 
    component: Sparkles,
    library: 'lucide',
    category: 'reward',
    tags: ['magic', 'shine', 'destellos']
  },
  { 
    name: 'Heart', 
    component: Heart,
    library: 'lucide',
    category: 'reward',
    tags: ['love', 'valentine', 'amor', 'corazon']
  },
  { 
    name: 'ThumbsUp', 
    component: ThumbsUp,
    library: 'lucide',
    category: 'reward',
    tags: ['like', 'approve', 'good', 'pulgar']
  },

  // Heroicons Solid - Prefer solid versions for better visibility
  { 
    name: 'AcademicCapSolid', 
    component: HeroiconsSolid.AcademicCapIcon,
    library: 'heroicons-solid',
    category: 'academic',
    tags: ['graduation', 'education', 'graduacion']
  },
  { 
    name: 'StarSolid', 
    component: HeroiconsSolid.StarIcon,
    library: 'heroicons-solid',
    category: 'achievement',
    tags: ['favorite', 'rating', 'estrella']
  },
  { 
    name: 'TrophySolid', 
    component: HeroiconsSolid.TrophyIcon,
    library: 'heroicons-solid',
    category: 'achievement',
    tags: ['award', 'winner', 'trofeo']
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
  { 
    name: 'ShieldCheckSolid', 
    component: HeroiconsSolid.ShieldCheckIcon,
    library: 'heroicons-solid',
    category: 'general',
    tags: ['protection', 'security', 'verified', 'escudo']
  },
  { 
    name: 'CurrencyDollarSolid', 
    component: HeroiconsSolid.CurrencyDollarIcon,
    library: 'heroicons-solid',
    category: 'finance',
    tags: ['money', 'cash', 'currency', 'dinero']
  },
  { 
    name: 'HeartSolid', 
    component: HeroiconsSolid.HeartIcon,
    library: 'heroicons-solid',
    category: 'reward',
    tags: ['love', 'valentine', 'amor', 'corazon']
  },
  { 
    name: 'GiftSolid', 
    component: HeroiconsSolid.GiftIcon,
    library: 'heroicons-solid',
    category: 'reward',
    tags: ['present', 'birthday', 'regalo']
  },

  // Heroicons Outline - Only include essential ones as solid versions are preferred
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

  // Tabler Icons - Solid style preferred
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
    name: 'CoinFilled', 
    component: TablerIcons.IconCoinFilled,
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
  { 
    name: 'DiamondFilled', 
    component: TablerIcons.IconDiamondFilled,
    library: 'tabler',
    category: 'reward',
    tags: ['gem', 'jewel', 'diamante']
  },
  { 
    name: 'Rosette', 
    component: TablerIcons.IconRosette,
    library: 'tabler',
    category: 'achievement',
    tags: ['award', 'badge', 'roseta']
  },
  { 
    name: 'RosetteFilled', 
    component: TablerIcons.IconRosetteFilled,
    library: 'tabler',
    category: 'achievement',
    tags: ['award', 'badge', 'roseta']
  },
  { 
    name: 'CircleCheckFilled', 
    component: TablerIcons.IconCircleCheckFilled,
    library: 'tabler',
    category: 'general',
    tags: ['complete', 'done', 'success', 'completado']
  },

  // Phosphor Icons - These come with fill variants built-in
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
  { 
    name: 'DiamondPhosphor', 
    component: PhosphorIcons.Diamond,
    library: 'phosphor',
    category: 'reward',
    tags: ['gem', 'jewel', 'diamante']
  },
  { 
    name: 'CrownPhosphor', 
    component: PhosphorIcons.Crown,
    library: 'phosphor',
    category: 'achievement',
    tags: ['king', 'royal', 'corona']
  },
  { 
    name: 'CoinPhosphor', 
    component: PhosphorIcons.Coin,
    library: 'phosphor',
    category: 'finance',
    tags: ['money', 'currency', 'moneda']
  },
  { 
    name: 'Student', 
    component: PhosphorIcons.Student,
    library: 'phosphor',
    category: 'academic',
    tags: ['education', 'school', 'estudiante']
  },
  { 
    name: 'Graduation', 
    component: PhosphorIcons.GraduationCap,
    library: 'phosphor',
    category: 'academic',
    tags: ['education', 'school', 'graduacion']
  },

  // Seasonal Icons
  { 
    name: 'Snowflake', 
    component: Snowflake,
    library: 'lucide',
    category: 'seasonal',
    tags: ['winter', 'christmas', 'snow', 'navidad', 'nieve']
  },
  { 
    name: 'Sun', 
    component: Sun,
    library: 'lucide',
    category: 'seasonal',
    tags: ['summer', 'hot', 'verano', 'sol']
  },
  { 
    name: 'TreePine', 
    component: TreePine,
    library: 'lucide',
    category: 'seasonal',
    tags: ['christmas', 'winter', 'tree', 'arbol']
  },
  { 
    name: 'Candy', 
    component: Candy,
    library: 'lucide',
    category: 'seasonal',
    tags: ['sweet', 'treat', 'dulce']
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
