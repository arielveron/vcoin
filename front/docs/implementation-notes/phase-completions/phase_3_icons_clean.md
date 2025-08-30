# Phase 3: Icon Integration System

## Quick Context

**What:** Multi-library icon system with searchable picker and animations  
**Why:** Visual rewards through icons enhance gamification and category distinction  
**Dependencies:** Phase 1 & 2 completed (categories exist with styles working)

## Current State Checkpoint

```yaml
prerequisites_completed: 
  - category_table_with_icon_config: true
  - style_system_working: true
  - admin_ui_functional: true
files_modified: []
tests_passing: true
can_continue: true
```

## Implementation Steps

### Step 1: Icon Library Setup (30 mins)

Install icon libraries:

```bash
npm install lucide-react @heroicons/react @tabler/icons-react @phosphor-icons/react @iconoir/react
```

Create `/src/lib/icon-registry.ts`

```typescript
// Central registry for all available icons across libraries
import * as LucideIcons from 'lucide-react';
import * as HeroiconsSolid from '@heroicons/react/24/solid';
import * as HeroiconsOutline from '@heroicons/react/24/outline';
import * as TablerIcons from '@tabler/icons-react';
import * as PhosphorIcons from '@phosphor-icons/react';
import * as IconoirIcons from '@iconoir/react';
import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

export type IconComponent = LucideIcon | ComponentType<{ className?: string; size?: number | string }>;

export interface IconDefinition {
  name: string;
  component: IconComponent;
  library: 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor' | 'iconoir';
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
    category: 'reward',
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
    category: 'achievement',
    tags: ['goal', 'aim', 'objective', 'objetivo']
  },
  { 
    name: 'Zap', 
    component: LucideIcons.Zap, 
    library: 'lucide', 
    category: 'reward',
    tags: ['lightning', 'energy', 'power', 'rayo']
  },
  { 
    name: 'Flame', 
    component: LucideIcons.Flame, 
    library: 'lucide', 
    category: 'reward',
    tags: ['fire', 'hot', 'streak', 'fuego']
  },
  { 
    name: 'Shield', 
    component: LucideIcons.Shield, 
    library: 'lucide', 
    category: 'achievement',
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
    name: 'AcademicCap', 
    component: HeroiconsSolid.AcademicCapIcon, 
    library: 'heroicons-solid', 
    category: 'academic',
    tags: ['graduation', 'education', 'graduacion']
  },
  { 
    name: 'Lightning', 
    component: HeroiconsSolid.BoltIcon, 
    library: 'heroicons-solid', 
    category: 'reward',
    tags: ['bolt', 'energy', 'power', 'rayo']
  },
  { 
    name: 'Fire', 
    component: HeroiconsSolid.FireIcon, 
    library: 'heroicons-solid', 
    category: 'reward',
    tags: ['flame', 'hot', 'fuego']
  },
  { 
    name: 'Sparkles', 
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
    category: 'reward',
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
    category: 'achievement',
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
    component: PhosphorIcons.RocketLaunch, 
    library: 'phosphor', 
    category: 'achievement',
    tags: ['launch', 'start', 'cohete']
  },
  { 
    name: 'Confetti', 
    component: PhosphorIcons.Confetti, 
    library: 'phosphor', 
    category: 'reward',
    tags: ['celebration', 'party', 'confeti']
  },

  // Iconoir
  { 
    name: 'MedalIconoir', 
    component: IconoirIcons.Medal, 
    library: 'iconoir', 
    category: 'achievement',
    tags: ['award', 'honor', 'medalla']
  },
  { 
    name: 'CrownIconoir', 
    component: IconoirIcons.Crown, 
    library: 'iconoir', 
    category: 'achievement',
    tags: ['king', 'royal', 'corona']
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
    icon.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
    icon.category.includes(lowerQuery) ||
    icon.library.includes(lowerQuery)
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
```

**STOP POINT 1** ✋

- ✅ Icon libraries installed
- ✅ Registry created with categorized icons
- ✅ Search functionality implemented

### Step 2: Icon Renderer Component (20 mins)

Create `/src/components/icon-renderer.tsx`

```typescript
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
    className: cn(
      className,
      animationClass,
      color && !color.startsWith('#') ? color : undefined
    ),
    style: color?.startsWith('#') ? { color } : undefined
  };

  return createElement(iconDef.component, iconProps);
}

// Memoized version for performance
import { memo } from 'react';

export const MemoizedIconRenderer = memo(IconRenderer);
```

Create `/src/components/admin/icon-preview.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';

interface IconPreviewProps {
  name?: string;
  library?: string;
  size?: number;
  color?: string;
  animationClass?: string;
  showLabel?: boolean;
  className?: string;
}

export default function IconPreview({
  name,
  library,
  size = 32,
  color,
  animationClass,
  showLabel = true,
  className
}: IconPreviewProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !name) {
    return (
      <div className={cn("flex flex-col items-center justify-center p-4", className)}>
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
        {showLabel && <span className="text-xs text-gray-500 mt-2">No icon</span>}
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
        animationClass={animationClass}
      />
      {showLabel && (
        <span className="text-xs text-gray-500 mt-2">
          {name}
        </span>
      )}
    </div>
  );
}
```

### Step 3: Icon Picker Component (45 mins)

Create `/src/components/admin/icon-picker.tsx`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchIcons, getIconsByCategory, type IconDefinition } from '@/lib/icon-registry';
import IconRenderer from '@/components/icon-renderer';
import { cn } from '@/lib/utils';

interface IconPickerProps {
  value?: {
    name: string;
    library: string;
  };
  onChange: (icon: { name: string; library: string } | null) => void;
  size?: number;
  color?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All Icons' },
  { id: 'achievement', label: 'Achievements' },
  { id: 'academic', label: 'Academic' },
  { id: 'reward', label: 'Rewards' },
  { id: 'finance', label: 'Finance' },
  { id: 'seasonal', label: 'Seasonal' },
  { id: 'general', label: 'General' }
];

export default function IconPicker({ value, onChange, size = 24, color }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [filteredIcons, setFilteredIcons] = useState<IconDefinition[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    let icons: IconDefinition[] = [];
    
    if (category === 'all') {
      icons = searchIcons(search);
    } else {
      icons = getIconsByCategory(category as any);
      if (search) {
        const lowerSearch = search.toLowerCase();
        icons = icons.filter(icon => 
          icon.name.toLowerCase().includes(lowerSearch) ||
          icon.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
        );
      }
    }
    
    setFilteredIcons(icons);
  }, [search, category, isClient]);

  const handleSelect = useCallback((icon: IconDefinition) => {
    onChange({
      name: icon.name,
      library: icon.library
    });
    setIsOpen(false);
    setSearch('');
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setIsOpen(false);
  }, [onChange]);

  if (!isClient) {
    return (
      <div className="relative">
        <button
          type="button"
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white"
          disabled
        >
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
          <span className="text-gray-500">Loading...</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 border rounded-md bg-white hover:bg-gray-50 transition-colors",
          isOpen ? "border-indigo-500 ring-2 ring-indigo-200" : "border-gray-300"
        )}
      >
        {value ? (
          <>
            <IconRenderer
              name={value.name}
              library={value.library}
              size={size}
              color={color}
            />
            <span className="text-sm">{value.name}</span>
          </>
        ) : (
          <span className="text-gray-500">Select icon...</span>
        )}
        <svg
          className={cn(
            "ml-2 h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Picker Panel */}
          <div className="absolute top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            {/* Search Bar */}
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Search icons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            {/* Category Tabs */}
            <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors",
                    category === cat.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Icons Grid */}
            <div className="max-h-80 overflow-y-auto p-4">
              {filteredIcons.length > 0 ? (
                <div className="grid grid-cols-8 gap-1">
                  {filteredIcons.map((icon) => (
                    <button
                      key={`${icon.library}-${icon.name}`}
                      type="button"
                      onClick={() => handleSelect(icon)}
                      className={cn(
                        "p-2 rounded hover:bg-gray-100 transition-colors relative group",
                        value?.name === icon.name && value?.library === icon.library
                          ? "bg-indigo-100 hover:bg-indigo-200"
                          : ""
                      )}
                      title={`${icon.name} (${icon.library})`}
                    >
                      <IconRenderer
                        name={icon.name}
                        library={icon.library}
                        size={20}
                        color={color}
                      />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {icon.name}
                        <div className="text-gray-400">{icon.library}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No icons found matching "{search}"
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t flex justify-between">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**STOP POINT 2** ✋

- ✅ Icon renderer component working
- ✅ Icon picker with search and categories
- ✅ Dropdown UI functional

### Step 4: Animation Classes Configuration (20 mins)

Create `/src/lib/icon-animations.ts`

```typescript
export interface IconAnimation {
  name: string;
  className: string;
  description: string;
  preview?: boolean;
}

export const ICON_ANIMATIONS: IconAnimation[] = [
  { 
    name: 'None', 
    className: '', 
    description: 'No animation' 
  },
  { 
    name: 'Spin', 
    className: 'animate-spin', 
    description: 'Continuous rotation',
    preview: true
  },
  { 
    name: 'Pulse', 
    className: 'animate-pulse', 
    description: 'Fading in and out',
    preview: true
  },
  { 
    name: 'Bounce', 
    className: 'animate-bounce', 
    description: 'Bouncing motion',
    preview: true
  },
  { 
    name: 'Wiggle', 
    className: 'animate-wiggle', 
    description: 'Wiggling motion',
    preview: true
  },
  { 
    name: 'Heartbeat', 
    className: 'animate-heartbeat', 
    description: 'Heartbeat effect',
    preview: true
  },
  { 
    name: 'Float', 
    className: 'animate-float', 
    description: 'Floating effect',
    preview: true
  },
  { 
    name: 'Shake', 
    className: 'animate-shake', 
    description: 'Shaking motion',
    preview: true
  }
];
```

Add custom animations to `/src/app/globals.css`

```css
/* Icon Animations */
@keyframes wiggle {
  0%, 100% { transform: rotate(-3deg); }
  50% { transform: rotate(3deg); }
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

.animate-heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-shake {
  animation: shake 0.5s ease-in-out infinite;
}

/* Hover-only animations */
.hover-spin:hover {
  animation: spin 1s linear infinite;
}

.hover-bounce:hover {
  animation: bounce 1s infinite;
}

.hover-pulse:hover {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Step 5: Update Category Admin UI with Icons (30 mins)

Update `/src/app/admin/categories/categories-admin-client.tsx`

Add imports:

```typescript
import IconPicker from '@/components/admin/icon-picker';
import IconPreview from '@/components/admin/icon-preview';
import { ICON_ANIMATIONS } from '@/lib/icon-animations';
```

Add icon state to form data:

```typescript
const [formData, setFormData] = useState<CreateInvestmentCategoryRequest>({
  name: '',
  level: 'bronze',
  text_style: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    textColor: 'text-gray-900'
  },
  icon_config: null, // Add default
  is_active: true,
  sort_order: 0
});

// Add separate state for icon preview
const [iconPreviewConfig, setIconPreviewConfig] = useState<{
  name?: string;
  library?: string;
  size?: number;
  color?: string;
  animationClass?: string;
}>({});
```

Update handleEdit to include icon config:

```typescript
const handleEdit = (category: InvestmentCategory) => {
  setEditingCategory(category);
  setFormData({
    name: category.name,
    level: category.level,
    text_style: category.text_style,
    icon_config: category.icon_config,
    is_active: category.is_active,
    sort_order: category.sort_order
  });
  
  // Set icon preview
  if (category.icon_config) {
    setIconPreviewConfig({
      name: category.icon_config.name,
      library: category.icon_config.library,
      size: category.icon_config.size || 24,
      color: category.icon_config.color,
      animationClass: category.icon_config.animationClass
    });
  }
  
  setShowForm(true);
};
```

Add icon configuration section to form (after text styling section):

```jsx
{/* Icon Configuration */}
<div className="border-t pt-4">
  <h4 className="text-md font-medium text-gray-900 mb-3">Icon Configuration</h4>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Icon
      </label>
      <IconPicker
        value={iconPreviewConfig.name ? {
          name: iconPreviewConfig.name,
          library: iconPreviewConfig.library || 'lucide'
        } : undefined}
        onChange={(icon) => {
          if (icon) {
            setIconPreviewConfig({
              ...iconPreviewConfig,
              name: icon.name,
              library: icon.library
            });
          } else {
            setIconPreviewConfig({});
          }
        }}
        size={24}
        color={iconPreviewConfig.color}
      />
    </div>
    
    <div>
      <label htmlFor="iconSize" className="block text-sm font-medium text-gray-700">
        Icon Size
      </label>
      <input
        type="number"
        id="iconSize"
        name="iconSize"
        min="16"
        max="64"
        value={iconPreviewConfig.size || 24}
        onChange={(e) => setIconPreviewConfig({
          ...iconPreviewConfig,
          size: parseInt(e.target.value)
        })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
    <div>
      <label htmlFor="iconColor" className="block text-sm font-medium text-gray-700">
        Icon Color
      </label>
      <input
        type="text"
        id="iconColor"
        name="iconColor"
        placeholder="e.g., #FFD700 or text-yellow-500"
        value={iconPreviewConfig.color || ''}
        onChange={(e) => setIconPreviewConfig({
          ...iconPreviewConfig,
          color: e.target.value
        })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      />
    </div>
    
    <div>
      <label htmlFor="iconAnimation" className="block text-sm font-medium text-gray-700">
        Animation
      </label>
      <select
        id="iconAnimation"
        name="iconAnimation"
        value={iconPreviewConfig.animationClass || ''}
        onChange={(e) => setIconPreviewConfig({
          ...iconPreviewConfig,
          animationClass: e.target.value
        })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
      >
        {ICON_ANIMATIONS.map((anim) => (
          <option key={anim.className} value={anim.className}>
            {anim.name} - {anim.description}
          </option>
        ))}
      </select>
    </div>
  </div>
  
  {/* Icon Preview */}
  {iconPreviewConfig.name && (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">Icon Preview:</p>
      <IconPreview
        name={iconPreviewConfig.name}
        library={iconPreviewConfig.library}
        size={iconPreviewConfig.size}
        color={iconPreviewConfig.color}
        animationClass={iconPreviewConfig.animationClass}
        showLabel={false}
      />
    </div>
  )}
</div>
```

Update form submission to include icon data:

```typescript
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formDataObj = new FormData(e.currentTarget);
  
  // Add icon config to form data
  if (iconPreviewConfig.name) {
    formDataObj.append('iconName', iconPreviewConfig.name);
    formDataObj.append('iconLibrary', iconPreviewConfig.library || 'lucide');
  }
  
  // Continue with existing submission logic...
};
```

Update table to show icons:

```typescript
<td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2">
    {category.icon_config && (
      <IconRenderer
        name={category.icon_config.name}
        library={category.icon_config.library}
        size={20}
        color={category.icon_config.color}
        animationClass={category.icon_config.animationClass}
      />
    )}
    <span 
      className={`
        ${category.text_style.fontSize || 'text-sm'} 
        ${category.text_style.fontWeight || 'font-normal'}
        ${category.text_style.fontStyle || ''}
        ${category.text_style.textColor || 'text-gray-900'}
        ${category.text_style.effectClass || ''}
      `}
      style={category.text_style.customCSS ? 
        Object.fromEntries(
          category.text_style.customCSS.split(';')
            .filter(rule => rule.trim())
            .map(rule => {
              const [key, value] = rule.split(':').map(s => s.trim());
              return [key, value];
            })
        ) : {}
      }
    >
      Sample Text
    </span>
  </div>
</td>
```

**STOP POINT 3** ✋

- ✅ Icon picker integrated in admin
- ✅ Icon preview working
- ✅ Animation selector functional

### Step 6: Update Server Actions for Icons (15 mins)

Update `/src/app/admin/categories/actions.ts`

Add icon handling in createCategory:

```typescript
const iconName = formData.get('iconName') as string;
const iconLibrary = formData.get('iconLibrary') as string;
const iconSize = formData.get('iconSize') ? parseInt(formData.get('iconSize') as string) : 24;
const iconColor = formData.get('iconColor') as string;
const iconAnimation = formData.get('iconAnimation') as string;

const categoryData: CreateInvestmentCategoryRequest = {
  name,
  level,
  text_style: {
    fontSize,
    fontWeight,
    textColor,
    effectClass: effectClass || undefined,
    customCSS: customCSS || undefined
  },
  icon_config: iconName ? {
    name: iconName,
    library: iconLibrary as any,
    size: iconSize,
    color: iconColor || undefined,
    animationClass: iconAnimation || undefined
  } : null,
  is_active: isActive,
  sort_order: sortOrder
};
```

Same updates for updateCategory function.

### Step 7: Display Icons in Student View (20 mins)

Update `/src/app/student/components/list-invertidos.tsx`

Add icon support to imports:

```typescript
import IconRenderer from '@/components/icon-renderer';
```

Update the investment display to include icons:

```typescript
{listInvertidos.map((item) => {
  const fechaDisplay = item.fecha.toISOString().split('T')[0];
  
  // Build style classes (existing code)
  const categoryStyle = item.category ? {
    className: [
      item.category.text_style.fontSize || 'text-sm',
      item.category.text_style.fontWeight || 'font-normal',
      item.category.text_style.fontStyle || '',
      item.category.text_style.textColor || 'text-gray-900',
      item.category.text_style.effectClass || ''
    ].filter(Boolean).join(' '),
    style: item.category.text_style.customCSS ? 
      Object.fromEntries(
        item.category.text_style.customCSS.split(';')
          .filter(rule => rule.trim())
          .map(rule => {
            const [key, value] = rule.split(':').map(s => s.trim());
            return [key, value];
          })
      ) : {}
  } : { className: 'text-gray-700', style: {} };
  
  return (
    <div key={`${item.id}-${fechaDisplay}`} className="grid grid-cols-[1fr_1fr_2fr] gap-2 items-start p-2 border-b border-gray-100 last:border-b-0">
      <div className="text-gray-700 text-nowrap">{fechaDisplay}</div>
      <div className="text-gray-700 text-right text-nowrap font-bold">{item.monto.toLocaleString("es-AR")} $</div>
      <div className="flex items-start gap-2">
        {item.category?.icon_config && (
          <div className="flex-shrink-0 mt-0.5">
            <IconRenderer
              name={item.category.icon_config.name}
              library={item.category.icon_config.library}
              size={item.category.icon_config.size || 20}
              color={item.category.icon_config.color}
              animationClass={item.category.icon_config.animationClass}
            />
          </div>
        )}
        <div 
          className={`text-xs leading-tight break-words ${categoryStyle.className}`}
          style={categoryStyle.style}
        >
          {item.concepto}
        </div>
      </div>
    </div>
  );
})}
```

### Step 8: Performance Optimization (15 mins)

Create `/src/utils/icon-cache.ts`

```typescript
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
  
  // Limit cache size
  if (iconComponentCache.size > 100) {
    const firstKey = iconComponentCache.keys().next().value;
    if (firstKey) iconComponentCache.delete(firstKey);
  }
}

// Preload commonly used icons
export async function preloadCommonIcons(): Promise<void> {
  const commonIcons = [
    { name: 'Trophy', library: 'lucide' },
    { name: 'Star', library: 'lucide' },
    { name: 'Medal', library: 'lucide' },
    { name: 'Crown', library: 'lucide' },
    { name: 'GraduationCap', library: 'lucide' }
  ];
  
  // Icons are already loaded in the registry, just warm up the cache
  if (typeof window !== 'undefined') {
    const { getIcon } = await import('@/lib/icon-registry');
    commonIcons.forEach(({ name, library }) => {
      const icon = getIcon(name, library);
      if (icon) {
        setCachedIcon(name, library, icon);
      }
    });
  }
}
```

Update icon renderer to use cache:

```typescript
import { getCachedIcon, setCachedIcon } from '@/utils/icon-cache';

export default function IconRenderer({ 
  name, 
  library, 
  size = 24, 
  color,
  className,
  animationClass 
}: IconRendererProps) {
  // Try cache first
  let iconDef = library ? getCachedIcon(name, library) : null;
  
  if (!iconDef) {
    iconDef = getIcon(name, library);
    if (iconDef && library) {
      setCachedIcon(name, library, iconDef);
    }
  }
  
  if (!iconDef) {
    console.warn(`Icon not found: ${name} from ${library || 'any library'}`);
    return null;
  }
  
  // Rest of component...
}
```

### Step 9: Testing & Documentation (15 mins)

Update `/src/config/translations.ts`

Add to categories section:

```typescript
// Icon related
iconConfiguration: 'Configuración de Icono',
selectIcon: 'Seleccionar Icono',
iconSize: 'Tamaño del Icono',
iconColor: 'Color del Icono',
iconAnimation: 'Animación',
noAnimation: 'Sin animación',
spin: 'Girar',
pulse: 'Pulsar',
bounce: 'Rebotar',
wiggle: 'Mover',
heartbeat: 'Latido',
float: 'Flotar',
shake: 'Sacudir',
iconPreview: 'Vista Previa del Icono',
searchIcons: 'Buscar iconos...',
allIcons: 'Todos los Iconos',
achievements: 'Logros',
academic: 'Académico',
rewards: 'Recompensas',
finance: 'Finanzas',
seasonal: 'Estacional',
general: 'General',
clearIcon: 'Limpiar',
```

**Verification Checklist:**

```bash
# Build check
npm run build

# Dev server
npm run dev
```

Test categories with icons:

1. **Bronze with Coin:**
   - Icon: Coin (Tabler)
   - Size: 20
   - No animation

2. **Silver with Medal:**
   - Icon: Medal (Lucide)
   - Size: 24
   - Color: #C0C0C0
   - Animation: Pulse

3. **Gold with Trophy:**
   - Icon: Trophy (Phosphor)
   - Size: 28
   - Color: #FFD700
   - Animation: Float

4. **Platinum with Crown:**
   - Icon: Crown (Lucide)
   - Size: 32
   - Color: text-purple-600
   - Animation: Heartbeat + Sparkle effect

**STOP POINT 4** ✋

- ✅ Icons display in admin
- ✅ Icons show in student view
- ✅ Animations working
- ✅ Performance acceptable
- ✅ No console errors

### Step 10: Bundle Size Optimization (10 mins)

Create `/src/lib/dynamic-icon-loader.ts`

```typescript
// Dynamic loading for rarely used icon libraries
import dynamic from 'next/dynamic';

// Lazy load icon picker to reduce initial bundle
export const DynamicIconPicker = dynamic(
  () => import('@/components/admin/icon-picker'),
  { 
    loading: () => <div>Loading icon picker...</div>,
    ssr: false 
  }
);

// Lazy load less common icon libraries
export async function loadIconLibrary(library: string) {
  switch(library) {
    case 'phosphor':
      return await import('@phosphor-icons/react');
    case 'iconoir':
      return await import('@iconoir/react');
    case 'tabler':
      return await import('@tabler/icons-react');
    default:
      return null;
  }
}
```

Update categories admin to use dynamic import:

```typescript
import { DynamicIconPicker } from '@/lib/dynamic-icon-loader';

// Use DynamicIconPicker instead of IconPicker
```

## Completion Checklist

```yaml
phase_3_completed:
  icon_system:
    - multi_library_support: true
    - icon_registry_created: true
    - search_functionality: true
    - category_filtering: true
  
  components:
    - icon_renderer: true
    - icon_picker: true
    - icon_preview: true
    - animations_configured: true
    
  admin_integration:
    - picker_in_category_form: true
    - preview_in_form: true
    - table_shows_icons: true
    - server_actions_updated: true
    
  student_integration:
    - icons_display_correctly: true
    - animations_working: true
    - performance_optimized: true
    - responsive_layout: true
    
  optimization:
    - icon_caching: true
    - dynamic_loading: true
    - bundle_size_managed: true
    
  testing:
    - all_libraries_tested: true
    - animations_verified: true
    - build_passes: true
    - no_console_errors: true
```

## Known Limitations & Solutions

1. **Bundle Size:** 5 icon libraries increase bundle
   - **Solution:** Dynamic imports for admin-only components

2. **Icon Loading:** Initial render might flicker
   - **Solution:** Icon cache and preloading implemented

3. **Browser Support:** Some animations need modern browsers
   - **Solution:** Graceful degradation, core functionality works everywhere

## Notes for Next Phase

Phase 4 will implement:
- Achievement system with automatic triggers
- Achievement unlocking logic
- Celebration modals
- Progress tracking

The icon system now provides rich visual feedback ready for achievements.

**Ready for Phase 4?** ✅