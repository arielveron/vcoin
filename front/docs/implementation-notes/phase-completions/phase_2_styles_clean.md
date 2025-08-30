# Phase 2: Styles & Effects System

## Quick Context

**What:** Advanced visual customization with premium CSS effects and style builder  
**Why:** Enable admins to create visually striking categories beyond basic styles  
**Dependencies:** Phase 1 completed (category infrastructure exists)

## Current State Checkpoint

```yaml
prerequisites_completed: 
  - category_table_exists: true
  - basic_text_styles_working: true
files_modified: []
tests_passing: true
can_continue: true
```

## Implementation Steps

### Step 1: Premium Effects CSS File (45 mins)

Create `/src/styles/premium-effects.css`

```css
/* Premium Visual Effects for Investment Categories */

/* Base animations */
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes color-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  50% { filter: hue-rotate(180deg); }
}

@keyframes sparkle {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* Gradient Effects */
.effect-gradient-gold {
  background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

.effect-gradient-silver {
  background: linear-gradient(90deg, #C0C0C0, #E8E8E8, #C0C0C0);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 4s linear infinite;
}

.effect-gradient-rainbow {
  background: linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #8b00ff);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 5s linear infinite;
}

.effect-gradient-fire {
  background: linear-gradient(90deg, #ff4500, #ff6347, #ff0000, #ff4500);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 2s linear infinite;
}

.effect-gradient-ice {
  background: linear-gradient(90deg, #00CED1, #00FFFF, #E0FFFF, #00CED1);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

/* Glow Effects */
.effect-glow-gold {
  text-shadow: 0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700;
  animation: pulse-glow 2s ease-in-out infinite;
}

.effect-glow-silver {
  text-shadow: 0 0 10px #C0C0C0, 0 0 20px #C0C0C0, 0 0 30px #C0C0C0;
  animation: pulse-glow 2.5s ease-in-out infinite;
}

.effect-glow-neon-blue {
  text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF, 0 0 40px #00FFFF;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.effect-glow-neon-pink {
  text-shadow: 0 0 10px #FF1493, 0 0 20px #FF1493, 0 0 30px #FF1493, 0 0 40px #FF1493;
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.effect-glow-toxic {
  text-shadow: 0 0 10px #00FF00, 0 0 20px #00FF00, 0 0 30px #00FF00;
  animation: pulse-glow 2s ease-in-out infinite;
}

/* Outline Effects */
.effect-outline-fire {
  -webkit-text-stroke: 2px #ff4500;
  text-stroke: 2px #ff4500;
  -webkit-text-fill-color: #ffff00;
  text-fill-color: #ffff00;
  filter: drop-shadow(0 0 3px #ff0000);
  animation: pulse-glow 1.5s ease-in-out infinite;
}

.effect-outline-electric {
  -webkit-text-stroke: 2px #00FFFF;
  text-stroke: 2px #00FFFF;
  -webkit-text-fill-color: #FFFFFF;
  text-fill-color: #FFFFFF;
  filter: drop-shadow(0 0 5px #00FFFF);
  animation: pulse-glow 0.5s ease-in-out infinite;
}

.effect-outline-shadow {
  -webkit-text-stroke: 1px #000000;
  text-stroke: 1px #000000;
  text-shadow: 3px 3px 6px rgba(0,0,0,0.7);
}

/* Motion Effects */
.effect-float {
  animation: float 3s ease-in-out infinite;
}

.effect-shake {
  animation: shake 0.5s ease-in-out infinite;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.effect-bounce {
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Special Effects */
.effect-sparkle {
  position: relative;
}

.effect-sparkle::before,
.effect-sparkle::after {
  content: '✨';
  position: absolute;
  font-size: 0.5em;
  animation: sparkle 2s ease-in-out infinite;
}

.effect-sparkle::before {
  top: -0.5em;
  left: -0.5em;
  animation-delay: 0s;
}

.effect-sparkle::after {
  bottom: -0.5em;
  right: -0.5em;
  animation-delay: 1s;
}

.effect-holographic {
  background: linear-gradient(45deg, 
    #ff0080, #ff8c00, #40e0d0, #ff0080, 
    #ff8c00, #40e0d0, #ff0080);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: holographic 3s ease infinite;
}

@keyframes holographic {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.effect-glitch {
  position: relative;
  animation: glitch 2s infinite;
}

@keyframes glitch {
  0%, 100% { 
    text-shadow: 
      2px 0 #ff00ff, 
      -2px 0 #00ffff;
  }
  50% { 
    text-shadow: 
      -2px 0 #ff00ff, 
      2px 0 #00ffff;
  }
}

/* Combination Classes */
.effect-premium-gold {
  composes: effect-gradient-gold effect-glow-gold effect-float;
}

.effect-premium-platinum {
  composes: effect-holographic effect-sparkle;
}

.effect-premium-legendary {
  composes: effect-gradient-rainbow effect-glow-neon-pink effect-bounce effect-sparkle;
}
```

Import CSS in `/src/app/globals.css`

Add after line 3:

```css
@import "../styles/premium-effects.css";
```

**STOP POINT 1** ✋

- ✅ CSS file created
- ✅ Effects display correctly
- ✅ No CSS conflicts

### Step 2: Update Category Type for Effects (15 mins)

Update `/src/types/database.ts`

Modify InvestmentCategory interface text_style (around line 60):

```typescript
text_style: {
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: string;
  textColor?: string;
  effectClass?: string;    // Already there, just confirming
  customCSS?: string;      // Add this - for inline styles
}
```

Update database to handle custom CSS

Add to `/src/scripts/init-database.sql` after investment_categories table:

```sql
-- Add custom CSS column if not in text_style JSONB
-- No action needed - JSONB already supports this
```

**STOP POINT 2** ✋

- ✅ Types updated
- ✅ Build passes

### Step 3: Style Preview Component (30 mins)

Create `/src/components/admin/style-preview.tsx`

```typescript
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
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <span 
          className={classNames}
          style={inlineStyles}
        >
          {text}
        </span>
      </div>
      {showEffectName && text_style.effectClass && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Effect: {text_style.effectClass}
        </div>
      )}
    </div>
  );
}
```

### Step 4: Enhanced Category Admin UI (45 mins)

Update `/src/app/admin/categories/categories-admin-client.tsx`

Add imports at top:

```typescript
import StylePreview from '@/components/admin/style-preview';
```

Add premium effects list after imports:

```typescript
const PREMIUM_EFFECTS = [
  { value: '', label: 'None' },
  { value: 'effect-gradient-gold', label: 'Gold Gradient' },
  { value: 'effect-gradient-silver', label: 'Silver Gradient' },
  { value: 'effect-gradient-rainbow', label: 'Rainbow Gradient' },
  { value: 'effect-gradient-fire', label: 'Fire Gradient' },
  { value: 'effect-gradient-ice', label: 'Ice Gradient' },
  { value: 'effect-glow-gold', label: 'Gold Glow' },
  { value: 'effect-glow-silver', label: 'Silver Glow' },
  { value: 'effect-glow-neon-blue', label: 'Neon Blue Glow' },
  { value: 'effect-glow-neon-pink', label: 'Neon Pink Glow' },
  { value: 'effect-glow-toxic', label: 'Toxic Glow' },
  { value: 'effect-outline-fire', label: 'Fire Outline' },
  { value: 'effect-outline-electric', label: 'Electric Outline' },
  { value: 'effect-outline-shadow', label: 'Shadow Outline' },
  { value: 'effect-float', label: 'Floating' },
  { value: 'effect-bounce', label: 'Bouncing' },
  { value: 'effect-sparkle', label: 'Sparkle' },
  { value: 'effect-holographic', label: 'Holographic' },
  { value: 'effect-glitch', label: 'Glitch' },
  { value: 'effect-premium-gold', label: 'Premium Gold (Combined)' },
  { value: 'effect-premium-platinum', label: 'Premium Platinum (Combined)' },
  { value: 'effect-premium-legendary', label: 'Legendary (All Effects)' }
];
```

Update state to track form changes for live preview:

```typescript
const [liveFormData, setLiveFormData] = useState<CreateInvestmentCategoryRequest>(formData);
```

Add effect dropdown to form after text color (around line 235):

```html
<div>
  <label htmlFor="effectClass" className="block text-sm font-medium text-gray-700">
    Premium Effect
  </label>
  <select
    id="effectClass"
    name="effectClass"
    value={liveFormData.text_style?.effectClass || ''}
    onChange={(e) => setLiveFormData({
      ...liveFormData,
      text_style: { ...liveFormData.text_style, effectClass: e.target.value }
    })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  >
    {PREMIUM_EFFECTS.map(effect => (
      <option key={effect.value} value={effect.value}>
        {effect.label}
      </option>
    ))}
  </select>
</div>
```

Add custom CSS field:

```html
<div className="col-span-3">
  <label htmlFor="customCSS" className="block text-sm font-medium text-gray-700">
    Custom CSS (Advanced)
  </label>
  <input
    type="text"
    id="customCSS"
    name="customCSS"
    placeholder="e.g., text-transform: uppercase; letter-spacing: 2px"
    value={liveFormData.text_style?.customCSS || ''}
    onChange={(e) => setLiveFormData({
      ...liveFormData,
      text_style: { ...liveFormData.text_style, customCSS: e.target.value }
    })}
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
  />
  <p className="mt-1 text-xs text-gray-500">
    CSS properties separated by semicolons. Be careful with this!
  </p>
</div>
```

Add live preview section before form actions:

```html
{/* Live Preview */}
<div className="border-t pt-4">
  <h4 className="text-md font-medium text-gray-900 mb-3">Live Preview</h4>
  <StylePreview 
    category={{ 
      level: liveFormData.level, 
      text_style: liveFormData.text_style 
    }} 
    text="Sample Investment Text"
    showEffectName={true}
  />
</div>
```

Update the preview in the table to use StylePreview component:

```typescript
<td className="px-6 py-4">
  <StylePreview 
    category={category} 
    text="Sample" 
    showEffectName={false}
  />
</td>
```

### Step 5: Update Server Actions for New Fields (15 mins)

Update `/src/app/admin/categories/actions.ts`

Add new fields handling in createCategory:

```typescript
const effectClass = formData.get('effectClass') as string;
const customCSS = formData.get('customCSS') as string;

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
  is_active: isActive,
  sort_order: sortOrder
};
```

Same for updateCategory function.

**STOP POINT 3** ✋

- ✅ Style preview working
- ✅ Effects selectable
- ✅ Live preview updates

### Step 6: Apply Styles to Student View (30 mins)

Update `/src/app/student/components/list-invertidos.tsx`

Add category support to the interface:

```typescript
import { InvestmentCategory } from '@/types/database';

interface InvestmentItem {
  id: number;
  fecha: Date;
  monto: number;
  concepto: string;
  category?: InvestmentCategory | null; // Add this
}
```

Update the investment display (around line 60):

```typescript
{listInvertidos.map((item) => {
  const fechaDisplay = item.fecha.toISOString().split('T')[0];
  
  // Build style classes
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
      <div 
        className={`text-xs leading-tight break-words ${categoryStyle.className}`}
        style={categoryStyle.style}
      >
        {item.concepto}
      </div>
    </div>
  );
})}
```

### Step 7: Update Data Service to Include Categories (20 mins)

Update `/src/services/server-data-service.ts`

Update getInvestmentsList to include categories:

```typescript
static async getInvestmentsList(studentId: number) {
  const dbAvailable = await this.checkDatabaseAvailability();
  
  if (dbAvailable && this.service) {
    try {
      const investments = await this.service.getInvestmentsByStudent(studentId);
      // Fetch categories for each investment
      const categoryIds = [...new Set(investments.map(inv => inv.category_id).filter(Boolean))];
      const categories = await Promise.all(
        categoryIds.map(id => this.service!.getCategoryById(id!))
      );
      const categoryMap = new Map(categories.map(cat => cat && [cat.id, cat]));
      
      return investments.map((investment) => ({
        id: investment.id,
        fecha: investment.fecha,
        monto: investment.monto,
        concepto: investment.concepto,
        category: investment.category_id ? categoryMap.get(investment.category_id) || null : null
      }));
    } catch (error) {
      console.error('Database error, falling back to pseudo-db:', error);
    }
  }
  
  // Fallback to pseudo-db - no categories
  return fondos
    .filter(fondo => fondo.student_id === studentId)
    .map((fondo) => ({
      id: fondo.id,
      fecha: fondo.fecha,
      monto: fondo.monto,
      concepto: fondo.concepto,
      category: null
    }));
}
```

### Step 8: Performance Optimization (20 mins)

Create `/src/utils/style-compiler.ts`

```typescript
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
          // Convert CSS property to camelCase for React
          const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
          return [camelKey, value];
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
```

Update ListInvertidos to use the compiler:

```typescript
import { compileInvestmentStyle } from '@/utils/style-compiler';

// In the render:
const categoryStyle = compileInvestmentStyle(item.category);
```

**STOP POINT 4** ✋

- ✅ Styles apply to student view
- ✅ Performance optimized
- ✅ No rendering issues

### Step 9: Testing & Verification (15 mins)

Create test categories via admin panel:

1. **Bronze Test:**
   - Font: Small, Normal
   - Color: Default
   - Effect: None

2. **Silver Test:**
   - Font: Base, Semibold
   - Color: Blue
   - Effect: Silver Gradient

3. **Gold Test:**
   - Font: Large, Bold
   - Color: Yellow
   - Effect: Gold Glow + Float

4. **Platinum Test:**
   - Font: Extra Large, Bold
   - Effect: Holographic + Sparkle
   - Custom CSS: text-transform: uppercase; letter-spacing: 2px

**Verification Checklist:**

```bash
# Build check
npm run build

# Dev server
npm run dev
```

- ✅ All effects render correctly
- ✅ No CSS conflicts
- ✅ Mobile responsive
- ✅ Performance acceptable (< 50ms render time)
- ✅ Effects don't break layout

### Step 10: Documentation Update (10 mins)

Update `/src/config/translations.ts`

Add to categories section:

```typescript
premiumEffect: 'Efecto Premium',
customCSS: 'CSS Personalizado',
livePreview: 'Vista Previa en Vivo',
advanced: 'Avanzado',
effectNone: 'Ninguno',
cssPlaceholder: 'ej: text-transform: uppercase; letter-spacing: 2px',
cssWarning: 'Propiedades CSS separadas por punto y coma. ¡Úsalo con cuidado!',
```

## Completion Checklist

```yaml
phase_2_completed:
  css_system:
    - premium_effects_created: true
    - effects_imported: true
    - no_conflicts: true
  
  admin_enhancements:
    - effect_selector: true
    - custom_css_field: true
    - live_preview: true
    - style_preview_component: true
    
  student_integration:
    - styles_apply_correctly: true
    - performance_optimized: true
    - cache_system_working: true
    
  testing:
    - all_effects_tested: true
    - mobile_responsive: true
    - build_passes: true
    - no_console_errors: true
```

## Known Limitations & Solutions

1. **Browser Compatibility:** Some effects may not work in older browsers
   - **Solution:** Graceful degradation, effects are enhancement only

2. **Performance:** Multiple animated effects can impact performance
   - **Solution:** Style compiler with caching implemented

3. **Custom CSS Security:** Admins could break layouts
   - **Solution:** Admin-only feature with warning message

## Notes for Next Phase

Phase 3 will add:
- Icon library integration (5 libraries)
- Icon picker component with search
- Icon rendering in investments
- Icon animations

The style system is now robust enough to support icon additions seamlessly.

**Ready for Phase 3?** ✅