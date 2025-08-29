# Function Organization Pattern for VCoin Admin Features

## Overview

This document establishes the pattern for organizing handler functions in VCoin admin features to maintain clean, modular, and maintainable code architecture.

## Pattern Structure

For each admin feature module, organize functions as follows:

```
src/presentation/features/admin/[module]/
├── components/           # UI Components
├── functions/           # Handler Functions (NEW PATTERN)
│   ├── form-handlers.ts
│   ├── [entity]-actions.ts
│   ├── filter-handlers.ts
│   ├── [specific-functionality].ts
│   └── index.ts
├── hooks/              # Feature-specific hooks
└── [Module]Page.tsx    # Orchestrator component
```

## Function Separation Criteria

### 1. **Form Operations** (`form-handlers.ts`)
**Scope**: Functions handling form submission, success, and cancellation
**Max file size**: ~50 lines
**Functions**:
- `handleFormSubmit` - Server action calls
- `handleFormSuccess` - State updates after successful operations  
- `handleFormCancel` - Form reset and cleanup

**Example**:
```typescript
export function createFormHandlers(
  editingEntity: EntityForClient | null,
  entities: EntityForClient[],
  setEntities: (entities: EntityForClient[]) => void,
  setEditingEntity: (entity: EntityForClient | null) => void,
  setIsFormOpen: (open: boolean) => void
): FormHandlers
```

### 2. **Entity Actions** (`[entity]-actions.ts`)
**Scope**: CRUD operations on primary entity (delete, toggle, bulk operations)
**Max file size**: ~60 lines
**Functions**:
- `handleDelete` - Entity deletion with confirmation
- `handleToggleStatus` - Status toggle operations
- `handleBulkActions` - Multi-entity operations

**Example**:
```typescript
export function createGroupActionHandlers(
  groups: GroupWithDetailsForClient[],
  setGroups: (groups: GroupWithDetailsForClient[]) => void,
  executeDelete: (formData: FormData) => Promise<ActionResult>,
  executeToggle: (formData: FormData) => Promise<ActionResult>
): GroupActionHandlers
```

### 3. **Filter Operations** (`filter-handlers.ts`)
**Scope**: Search, filtering, and URL parameter management
**Max file size**: ~40 lines
**Functions**:
- `handleFiltersChange` - URL parameter updates
- `handleSearch` - Search functionality (if separate from filters)

**Example**:
```typescript
export function createFilterHandlers(
  router: ReturnType<typeof useRouter>
): FilterHandlers
```

### 4. **Specific Functionality** (`[functionality].ts`)
**Scope**: Domain-specific operations (student assignment, role management, etc.)
**Max file size**: ~70 lines
**Functions**: Related to specific business operations

**Example**: `student-assignment.ts`
```typescript
export function createStudentAssignmentHandlers(
  // ... parameters
): StudentAssignmentHandlers
```

## Implementation Guidelines

### File Organization Rules

1. **Keep files small**: Maximum 70 lines per function file
2. **Single responsibility**: Each file handles one functional area
3. **Descriptive naming**: File names clearly indicate functionality
4. **Type safety**: All parameters must have explicit types (no `any`)

### Function Naming Convention

- **Handlers**: `handle[Action]` (e.g., `handleFormSubmit`, `handleDelete`)
- **Factory functions**: `create[Module]Handlers` (e.g., `createFormHandlers`)
- **Types**: `[Module]Handlers` (e.g., `FormHandlers`, `GroupActionHandlers`)

### Parameter Organization

Functions should receive:
1. **State variables** (entities, editing state)
2. **State setters** (update functions)
3. **External dependencies** (router, execute functions)
4. **Context data** (current selections, modal state)

### Return Pattern

All factory functions return an object with handler functions:

```typescript
return {
  handleAction1,
  handleAction2,
  handleAction3
}
```

## Integration in Orchestrator Component

### Import Pattern
```typescript
// Import handler functions
import {
  createFormHandlers,
  createEntityActionHandlers,
  createFilterHandlers,
  createSpecificHandlers
} from './functions'
```

### Usage Pattern
```typescript
// Create handler functions using extracted modules
const { handleFiltersChange } = createFilterHandlers(router)

const { handleFormSubmit, handleFormSuccess, handleFormCancel } = createFormHandlers(
  editingEntity,
  entities,
  setEntities,
  setEditingEntity,
  setIsFormOpen
)

const { handleDelete, handleToggleStatus } = createEntityActionHandlers(
  entities,
  setEntities,
  executeDelete,
  executeToggle
)
```

## Benefits

### Code Organization
- **Reduced file size**: Main component focuses on coordination
- **Improved readability**: Functions grouped by purpose
- **Better testability**: Individual function files can be unit tested
- **Enhanced reusability**: Functions can be shared across similar features

### Maintenance
- **Easier debugging**: Issues isolated to specific functional areas
- **Simplified refactoring**: Changes contained within functional boundaries
- **Clear responsibilities**: Each file has a single, well-defined purpose

### Team Development
- **Parallel development**: Different developers can work on different function files
- **Code review efficiency**: Smaller, focused files for review
- **Knowledge transfer**: Clear separation makes onboarding easier

## Migration Strategy

### For Existing Modules

1. **Audit current handlers** in the main component
2. **Group by functionality** using the criteria above
3. **Extract to separate files** maintaining original signatures
4. **Update main component** to use factory functions
5. **Test thoroughly** to ensure no regressions
6. **Remove unused code** and clean up imports

### Implementation Checklist

- [ ] Create `functions/` directory
- [ ] Identify handler functions in main component
- [ ] Group functions by the established criteria
- [ ] Create individual function files with proper types
- [ ] Create index file for centralized exports
- [ ] Update main component to use factory functions
- [ ] Remove original handler code from main component
- [ ] Test build and functionality
- [ ] Remove unused imports and variables

## Example Implementation

### Before (Monolithic)
```typescript
// StudentsPage.tsx (300+ lines)
export default function StudentsPage() {
  // 50+ lines of handler functions mixed with component logic
  const handleCreate = async (formData) => { /* ... */ }
  const handleDelete = async (id) => { /* ... */ }
  const handleFiltersChange = (filters) => { /* ... */ }
  // ... more handlers
  
  return <div>{/* JSX */}</div>
}
```

### After (Modular)
```typescript
// StudentsPage.tsx (150 lines)
import { createFormHandlers, createStudentActionHandlers } from './functions'

export default function StudentsPage() {
  const { handleFormSubmit, handleFormSuccess } = createFormHandlers(...)
  const { handleDelete, handleToggleStatus } = createStudentActionHandlers(...)
  
  return <div>{/* JSX */}</div>
}

// functions/form-handlers.ts (40 lines)
export function createFormHandlers(...) {
  // Form-specific logic only
}

// functions/student-actions.ts (50 lines)  
export function createStudentActionHandlers(...) {
  // Student action logic only
}
```

## Next Steps

Apply this pattern to existing admin modules in the following order:

1. **Students** (`/admin/students`) - Most complex, good test case
2. **Investments** (`/admin/investments`) - High complexity
3. **Classes** (`/admin/classes`) - Medium complexity
4. **Categories** (`/admin/categories`) - Simple, good validation
5. **Interest Rates** (`/admin/tasas`) - Simple, final validation

Each migration should follow the established pattern and maintain all existing functionality while improving code organization.
