# VCoin Investment Tracking - AI Coding Agent Guidelines

VCoin is a Next.js 15 investment tracking application for students with dual authentication systems and server-first architecture. This guide focuses on project-specific patterns and architectural decisions that differ from standard Next.js applications.

## Architecture Overview

### Core Structure
- **Main App**: Student-facing investment dashboard (`/`) with real-time calculations
- **Admin Panel**: Complete CRUD management for classes, students, investments, and interest rates (`/admin`)
- **Database-First**: PostgreSQL with connection pooling, fallback to pseudo-db for development
- **Server Components**: Data fetching happens server-side, client components handle UI interactions

### Architectural Foundation (Post-Refactoring)
**VCoin follows a clean, layered architecture with strict separation of concerns:**

```
src/
├── core/                   # 🧠 Business Logic & Domain
│   ├── domain/            # Domain entities and business rules
│   ├── use-cases/         # Application use cases
│   └── ports/             # Interfaces for external services
├── infrastructure/         # 🔧 Technical Implementation
│   ├── database/          # Data access layer
│   ├── auth/              # Authentication systems
│   └── external/          # External service integrations
├── presentation/          # 🎨 UI Layer
│   ├── features/         # Feature-specific components
│   │   ├── admin/        # Refactored admin components
│   │   └── student/      # Student-facing components
│   └── hooks/            # Reusable business logic hooks
├── shared/               # 🔄 Shared Utilities
│   ├── utils/           # Pure utility functions
│   ├── types/           # Shared TypeScript types
│   └── constants/       # Global constants
└── utils/               # 📊 Centralized Data & Actions
    ├── admin-data-types.ts    # Standardized admin data types
    ├── admin-server-action-types.ts # Server action type patterns
    └── server-actions.ts      # Authentication wrappers
```

### Key Patterns

#### Repository Pattern
Service → Repository → Database layers:
```typescript
AdminService → StudentRepository → Database
AdminService → InvestmentRepository → Database
```

#### Server/Client Component Split
- **Server Components** (`page.tsx`): Authentication, data fetching, initial props
- **Presentation Layer Components**: Feature-based organization in `/src/presentation/features/`
- **Reusable Hooks**: Business logic extracted to `/src/presentation/hooks/`
- **Server Actions** (`actions.ts`): Form processing with authentication checks
This project never uses API routes except for authentication or if required by third-party libraries.
The connection to the database is always through server actions.
Date and currency formatting is done in the server components using centralized utilities.

#### Interest Rate Calculations
Complex financial calculations in `/src/core/domain/investment/calculations.ts`:
- Monthly → Daily → Seconds conversion for compound interest
- Historical rate tracking with effective dates
- End-date finalization vs. real-time calculations

#### Cross-Entity Filter Pattern
For features requiring filtered data from related entities (e.g., filtered investment counts on Students page):
- **Enhanced Service Methods**: Add filtered versions alongside basic methods (`getInvestmentCountsByStudents` + `getFilteredInvestmentCountsByStudents`)
- **Server Component Logic**: Detect active filters and choose appropriate service method
- **Reusable Filter Components**: Create entity-specific filter components that share the same URL parameters
- **Client-Side Transformation**: Use centralized utilities to transform server action results to match client component expectations

```typescript
// Example: Students page with investment count filtering
const hasInvestmentFilters = filters.categoryId || filters.date || filters.searchText
const investmentCounts = hasInvestmentFilters
  ? await adminService.getFilteredInvestmentCountsByStudents(studentIds, investmentFilters)
  : await adminService.getInvestmentCountsByStudents(studentIds)
```

**Benefits**: Maintains architectural consistency, reuses existing filter infrastructure, preserves separation of concerns

## Development Workflows

### Database Setup
```bash
npm run setup  # Creates tables, sample data, and auth system (includes student auth tables)
npm run db:test  # Verify database connectivity
npm run db:init  # Alternative database initialization
```

### Key Commands
- `npm run dev` - Development with Turbopack
- `npm run setup` - Complete database and admin setup (includes student auth tables)
- `npm run setup:env` - Generate secure secrets automatically
- `npm run db:test` - Verify database connectivity
- `npm run db:init` - Alternative database initialization
- Use server actions instead of API routes for forms

### Authentication Flow
**Dual Authentication System:**
- **Admin Auth**: NextAuth.js v5 with Google OAuth + email whitelist
- **Student Auth**: Secure bcrypt-based system with encrypted sessions

**Admin Routes** (`/admin/*`):
- Protected by middleware and session checks
- Server actions use standardized `withAdminAuth()` wrapper
- Development mode allows any email, production uses `ADMIN_EMAILS`

**Student Routes** (`/student/*`):
- Protected by `SecureStudentSessionService` with encrypted, signed sessions
- Server actions use standardized `withStudentAuth()` wrapper
- Sessions are tamper-proof with HMAC signatures and automatic expiration

## Project-Specific Conventions

## Project-Specific Conventions

### Import Path Aliases
**Use TypeScript path aliases for clean imports:**
```typescript
// Core business logic
import { calculateCompoundInterest } from '@/core/domain/investment/calculations'

// Infrastructure (data access, auth)
import { StudentRepository } from '@/infrastructure/database/repositories/StudentRepository'

// Presentation layer (components, hooks)
import { useServerAction } from '@/presentation/hooks'
import { StudentsTable } from '@/presentation/features/admin/students/components/StudentsTable'

// Shared utilities
import { formatCurrency } from '@/shared/utils/formatting'
import { validateRequired } from '@/shared/utils/validation'

// Centralized admin utilities
import { StudentForClient, formatStudentsForClient } from '@/utils/admin-data-types'
import { ActionResult } from '@/utils/admin-server-action-types'
```

### Standardized Server Actions
**All server actions use consistent patterns with centralized utilities:**
```typescript
// Import standardized utilities
import { withAdminAuth, validateRequired, parseFormNumber } from '@/utils/server-actions'
import type { ActionResult } from '@/utils/admin-server-action-types'

// Admin actions pattern - ALWAYS use ActionResult<T>
export const createEntity = withAdminAuth(async (formData: FormData): Promise<ActionResult<Entity>> => {
  const missing = validateRequired(formData, ['field1', 'field2'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
  
  const field1 = formData.get('field1') as string
  const field2 = parseFormNumber(formData, 'field2')
  
  return await service.createEntity({ field1, field2 })
}, 'create entity')

// Student actions pattern  
export const updateProfile = withStudentAuth(async (formData: FormData): Promise<ActionResult<StudentProfile>> => {
  // validation and logic here
  return await service.updateProfile(data)
}, 'update profile')
```

**Standard Response Format (ActionResult<T>):**
```typescript
// Success response
{ success: true, data: T, message?: string }

// Error response  
{ success: false, error: string, code?: string }
```

**CRITICAL**: All server actions MUST use `ActionResult<T>` return type from `/src/utils/admin-server-action-types.ts`

**API Routes** (only for authentication or third-party requirements):
- `/api/auth/[...nextauth]` - NextAuth.js handlers
- `/api/auth/student/*` - Student login/logout endpoints

### Centralized Data Types & Formatting
**Use standardized utilities to prevent duplication:**

```typescript
// Import centralized types and formatters
import { 
  StudentForClient, 
  ClassForClient, 
  InvestmentForClient,
  formatStudentsForClient, 
  formatClassesForClient,
  formatInvestmentsForClient 
} from '@/utils/admin-data-types'

// In server components (page.tsx)
const rawStudents = await adminService.getAllStudents()

// Get investment counts for computed properties
const studentIds = rawStudents.map(student => student.id)
const investmentCounts = await adminService.getInvestmentCountsByStudents(studentIds)

// Use centralized formatters with computed data
const studentsForClient = formatStudentsForClient(rawStudents, investmentCounts)

// Pass to client component with proper typing
<StudentsAdminClient initialStudents={studentsForClient} />
```

**Benefits of centralized approach:**
- ✅ Eliminates duplicate type definitions across components
- ✅ Consistent date/currency formatting everywhere
- ✅ Type safety between server actions and components
- ✅ Single source of truth for data transformations

### Presentation Layer Organization
**Feature-based component structure:**

```typescript
// Admin components organized by feature
src/presentation/features/admin/
├── students/
│   ├── StudentsPage.tsx          # Main orchestrator component
│   ├── components/
│   │   ├── StudentsTable.tsx     # Focused table component
│   │   ├── StudentForm.tsx       # Focused form component
│   │   └── PasswordDialog.tsx    # Specific dialog component
│   └── hooks/
│       └── useStudents.ts        # Feature-specific business logic
├── investments/
├── classes/
└── shared/
    └── components/               # Shared admin components
```

**Reusable Hooks Pattern:**
```typescript
// Use standardized hooks for common patterns
import { useServerAction, useFormModal, useDataTable, useMediaQuery, useCollapsibleStore } from '@/presentation/hooks'

// In client components
const { executeAction, loading, error } = useServerAction(serverActionFunction)
const { isOpen, openModal, closeModal } = useFormModal()
const { filteredData, sortedData, searchQuery } = useDataTable(data, columns)
const isWideScreen = useMediaQuery('(min-width: 768px)')
const { isExpanded, toggle } = useCollapsibleStore()
```

**Client-Side Transformation Pattern:**
```typescript
// When server actions return raw database objects but client expects formatted types
const handleFormSuccess = (rawStudent: Student) => {
  // Transform raw result to match client component expectations
  const studentForClient = formatStudentForClient(rawStudent, 0) // 0 investment count for new student
  
  if (editingStudent) {
    // Update existing student in state
    setStudents(students.map(s =>
      s.id === editingStudent.id ? studentForClient : s
    ))
  } else {
    // Add new student to state
    setStudents([studentForClient, ...students])
  }
}
```

**Benefits**: Maintains server action return type consistency while enabling rich client-side data

### Data Types
- **Dates**: Always use `Date` objects, not strings (PostgreSQL handles conversion)
- **Currency**: Integer storage (cents), formatted display with `es-AR` locale
- **Registry Numbers**: Student identification system via `registro` field
- **Computed Properties**: Include computed fields like `investment_count` in `*ForClient` types for rich UI data

### Formatting Standards
- **Currency**: `es-AR` locale with ARS symbol
- **Dates**: `es-AR` format (DD/MM/YYYY)
- **Percentages**: 2 decimal places with % symbol

### Date and Currency Formatting Pattern (CRITICAL)
**Server-Side Formatting to Prevent Hydration Mismatches:**

```typescript
// 1. Use centralized formatting utilities (PREFERRED)
import { formatStudentsForClient, StudentForClient } from '@/utils/admin-data-types'

// 2. In server components (page.tsx) - use centralized formatters
const rawStudents = await adminService.getAllStudents()
const studentsForClient = formatStudentsForClient(rawStudents)

// 3. Pass to client component with proper typing
<StudentsAdminClient initialStudents={studentsForClient} />

// 4. Alternative: Direct utility usage for custom cases
import { withFormattedDates, DateFieldSets } from '@/utils/format-dates'
const classesForClient = withFormattedDates(classes, [...DateFieldSets.CLASS_FIELDS])
```

**Benefits of this approach:**
- ✅ Prevents hydration mismatches (server/client render exactly the same)
- ✅ Keeps original `Date` objects for calculations and logic
- ✅ Provides pre-formatted strings for display (`field_name_formatted`)
- ✅ DRY principle - centralized utilities eliminate duplication
- ✅ Type safety with standardized `*ForClient` types

**Available Centralized Formatters:**
```typescript
// From /src/utils/admin-data-types.ts
formatStudentsForClient(students, investmentCounts?) → StudentForClient[] // Includes investment_count
formatClassesForClient(classes) → ClassForClient[]
formatInvestmentsForClient(investments) → InvestmentForClient[]
formatCategoriesForClient(categories) → CategoryForClient[]
formatInterestRatesForClient(rates) → InterestRateForClient[]
```

**Client Component Usage:**
```typescript
// Use original dates for calculations
const daysSinceInvestment = differenceInDays(new Date(), investment.fecha)

// Use formatted strings for display
<td>{investment.fecha_formatted}</td>
<td>{investment.monto_formatted}</td>
```

### Form Auto-fill Pattern (CRITICAL)
**Consistent auto-fill behavior across all admin forms:**

```typescript
// 1. Form key resets when filter changes
<form key={`create-${filters.classId || filters.studentId || 'all'}`} action={handleCreate}>

// 2. Auto-fill relevant field based on active filter
<select 
  defaultValue={filters.classId ? filters.classId.toString() : ''}
  name="class_id"
>
  <option value="">Select a class</option>
  {classes.map(...)}
</select>

// 3. Limit options to relevant items when filter is active
const filteredStudents = filters.classId 
  ? students.filter(student => student.class_id === filters.classId)
  : students

<select defaultValue={filters.studentId ? filters.studentId.toString() : ''}>
  {filteredStudents.map(...)} // Only show relevant students
</select>
```

**Benefits of this approach:**
- ✅ Improves UX - pre-fills expected values when context is clear
- ✅ Reduces errors - limits options to relevant choices
- ✅ Form resets properly when filter changes via form key
- ✅ Graceful fallback when no filter is active

**Applied consistently in:**
- Classes Admin: Auto-fills when editing existing class
- Students Admin: Auto-fills class when class filter is active  
- Investments Admin: Auto-fills student when student filter is active
- Interest Rates Admin: Auto-fills class when class filter is active

### File Naming
- Server components: `page.tsx`
- Client components: `*-admin-client.tsx` or `*-student-*.tsx`
- Server actions: `actions.ts` (admin) or `/src/actions/*-actions.ts` (student/investment)
- Types: Centralized in `/src/types/database.ts`
- **Utilities**: `/src/utils/server-actions.ts` for standardized patterns
- **Shared Utilities**: `/src/shared/utils/` for pure functions (formatting, validation, errors)
- **Presentation Hooks**: `/src/presentation/hooks/` for reusable UI logic (components, state management, media queries)
- **Legacy Hooks**: `/src/hooks/` for admin-specific hooks (will be migrated)

### Standardized Error Handling
**Consistent patterns across the codebase:**
```typescript
// Server actions automatically handle errors via withAdminAuth/withStudentAuth wrappers
// Use centralized error utilities from shared layer
import { handleError, formatErrorMessage } from '@/shared/utils/errors'

// Services use try-catch with graceful degradation
try {
  return await this.service.getData()
} catch (error) {
  console.error('Database error, falling back to pseudo-db:', error)
  return fallbackData
}

// Client components check result.success
if (!result.success) {
  alert(result.error || 'Operation failed')
  return
}
```

**Key principles:**
- Server actions return standardized `ActionResult<T>` objects
- Services log errors and gracefully degrade (database → pseudo-db fallback)
- Client components show user-friendly error messages
- Authentication and validation are handled by wrapper functions
- Use centralized error utilities from `/src/shared/utils/errors/`

## Key Integration Points

### Dual Authentication Systems
**Admin Authentication:**
- NextAuth.js v5 with PostgreSQL adapter
- Google OAuth with email/domain whitelist
- Session-based with database storage

**Student Authentication:**
- Secure encrypted sessions with HMAC signatures
- Custom bcrypt system (12 salt rounds)
- Login throttling with exponential backoff
- Tamper-proof sessions with `SecureStudentSessionService`
- Password management by admins, profile updates by students

### Database Connection
- Connection pool in `/src/config/database.ts`
- Auto-reconnection and timeout handling
- Environment variables for credentials
- Fallback to pseudo-db for development if PostgreSQL unavailable

### Session Security
- **Encrypted Sessions**: AES-256-CBC encryption for session data
- **HMAC Authentication**: SHA-256 signatures prevent tampering
- **Automatic Expiration**: 7-day session lifetime with timestamp validation
- **Secure Environment**: `SESSION_SECRET` required for encryption key

### Interest Rate System
- Historical tracking with effective dates
- Automatic rate application based on investment dates
- Complex compound interest calculations (monthly/daily/seconds)

### Admin Filtering
Custom hook `useAdminFilters` for cross-page state:
- Class/Student filtering across all admin pages
- URL parameter persistence
- Filter badges component for UX

### Student Authentication Workflow
**Login Process:**
- Students login at `/login` with class_id/registro/password
- Input validation and normalization (01 → 1)
- Login throttling with exponential backoff (1s → 30s max)
- Comprehensive security logging for failed attempts
- Secure session creation via `SecureStudentSessionService`

**Session Security:**
- Encrypted session data (AES-256-CBC) prevents cookie manipulation
- HMAC-SHA256 signatures detect tampering attempts
- Automatic session destruction on invalid/expired sessions
- Database verification on every session validation

**Password Management:**
- Admins set initial passwords via admin panel
- Students change passwords in `/student/profile`
- bcrypt hashing with 12 salt rounds
- Current password verification for changes

### Internationalization
Basic translation system in `/src/config/translations.ts` with `es-AR` focus.

## Security & Authentication

### Session Security
**Student sessions use encrypted, signed cookies:**
- AES-256-CBC encryption prevents data tampering  
- HMAC-SHA256 signatures detect modifications
- 7-day expiration with automatic cleanup
- **Required**: `SESSION_SECRET` (64-byte hex) in environment

### Admin Configuration Flexibility
**Authentication configuration checks:**
- Development: Any email allowed if auth not configured
- Production: `ADMIN_EMAILS` comma-separated list required
- Graceful fallback: Shows config instructions if OAuth not set up
- Database connectivity validation for admin sessions

### Environment Variable Management
**Required variables with validation:**
```bash
AUTH_SECRET=your-auth-secret-here  # (replaces NEXTAUTH_SECRET)
SESSION_SECRET=your-session-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Setup commands:**
```bash
npm run setup:env  # Generates secure secrets automatically
npm run setup     # Complete database + auth setup
```

### Password Security
- Student passwords: bcrypt with 12 salt rounds
- Login throttling: Exponential backoff (1s → 30s max)
- Password changes: Current password verification required

## Critical Dependencies
- **NextAuth.js v5**: Latest beta with PostgreSQL adapter
- **pg**: Direct PostgreSQL client with connection pooling
- **bcrypt**: Password hashing for student authentication
- **date-fns**: Date calculations and formatting
- **Tailwind CSS**: Consistent admin panel styling
- **React 19** + **Next.js 15.3.5**: Latest stable versions

## Common Tasks
- **Adding new entities**: Follow the Repository → Service → Admin Client → Actions pattern
- **Interest rate changes**: Use admin panel, automatic historical tracking
- **New calculations**: Extend `/src/core/domain/investment/calculations.ts` with proper date handling
- **Database changes**: Create database tables with SQL scripts in `/src/scripts/init-database.sql` and in `/src/scripts/setup-db.ts`. Never create new migrations. Mantain database integrity with proper foreign keys and constraints. Keep the database schema in sync with the application code. Mantain a single source of truth for the database schema.
- **Student password management**: Use admin panel or `StudentAuthService` methods
- **New admin features**: Create `page.tsx` (server), `*-admin-client.tsx` (client), `actions.ts` (forms)
- **New server actions**: Use `withAdminAuth()` or `withStudentAuth()` wrappers from `/src/utils/server-actions.ts`
- **Cross-entity filtering**: Add filtered service methods (e.g., `getFilteredInvestmentCountsByStudents`), detect filter state in server components, create reusable filter components
- **Shared utilities**: Add to `/src/shared/utils/` for pure functions (formatting, validation, errors)
- **Business logic**: Add to `/src/core/domain/` organized by entity (investment, student, etc.)
- **UI patterns**: Create reusable hooks in `/src/presentation/hooks/` for common component logic
- **Feature-specific hooks**: Add to `/src/presentation/features/*/hooks/` for domain-specific business logic
- **Legacy migration**: Move hooks from `/src/hooks/` to appropriate feature folders

## Key Development Workflows

### Hook Organization
**VCoin follows a structured hook organization:**

```
src/
├── hooks/                     # 🔄 Legacy Location (Empty after migration)
└── presentation/hooks/        # 🎨 Reusable UI Hooks
    ├── index.ts              # Centralized exports
    ├── useServerAction.ts    # Server action patterns
    ├── useFormModal.ts       # Modal state management
    ├── useDataTable.ts       # Table filtering/sorting
    ├── useMediaQuery.ts      # Responsive breakpoint detection
    └── useCollapsibleStore.tsx # Synchronized collapsible state
└── presentation/features/*/hooks/ # 🎯 Feature-Specific Business Logic
    └── admin/hooks/
        └── useAdminFilters.ts # Admin filtering across pages
```

**Placement Rules:**
- **Reusable UI patterns**: `/src/presentation/hooks/` (e.g., `useMediaQuery`, `useCollapsibleStore`, `useFormModal`)
- **Data management patterns**: `/src/presentation/hooks/` (e.g., `useServerAction`, `useDataTable`)  
- **Feature-specific business logic**: `/src/presentation/features/*/hooks/` (e.g., admin filtering, student-specific logic)
- **Legacy location**: `/src/hooks/` is deprecated and should not be used for new hooks

### Setup Commands
```bash
npm run setup:env # Generate secure secrets automatically  
npm run setup     # Complete database + auth setup (includes student tables)
npm run dev       # Development with Turbopack
npm run db:test   # Verify database connectivity
```

### Authentication Flow & Admin Panel Access
**Configuration-aware admin panel:**
- Graceful handling when Google OAuth not configured
- Error components guide setup: `AuthConfigError`, `DatabaseConnectionError`  
- Development vs production email whitelist handling
- Database connectivity validation with fallback messages

### Interest Rate System
- Historical tracking with effective dates in `InterestRateHistory`
- Compound calculations: Monthly → Daily → Seconds conversion
- Auto-applies rates based on investment dates

### Refactoring Patterns & META-PRINCIPLE
**Established META-PRINCIPLE for architectural consistency:**
> **"When facing architectural inconsistencies or implementing shared functionality, ALWAYS: AUDIT → ANALYZE → UNIFY → APPLY"**

**Key Refactoring Achievements:**
1. **Pattern Consistency**: All admin components follow identical patterns
2. **Type Safety**: 100% ActionResult<T> compliance across all server actions
3. **Data Type Unification**: Eliminated duplicate type definitions via centralized utilities
4. **Component Organization**: Feature-based structure in `/src/presentation/features/`
5. **Business Logic Extraction**: Reusable hooks in `/src/presentation/hooks/`

**Architectural Standards Applied:**
- Single responsibility per component (no components > 200 lines)
- Consistent server action patterns with authentication wrappers
- Centralized formatting and type definitions
- Proper separation between server/client concerns
- Feature-based organization over technical organization

### Adding New Features
1. **Entity**: Define in `/src/types/database.ts`
2. **Repository**: CRUD operations in `/src/repos/`
3. **Service**: Business logic in `/src/services/`
4. **Server Component**: `page.tsx` with auth + data fetching
5. **Client Component**: `*-admin-client.tsx` with forms
6. **Server Actions**: `actions.ts` with `withAdminAuth`/`withStudentAuth` wrappers

## Centralized Utilities & Architectural Philosophy

**Don't reinvent the wheel!** This motto drives VCoin because it already includes comprehensive tools and centralized solutions for most common fundamental operations. Look for existing solutions, upgrade them if you need an improvement, or create new ones if you expect that what you need to do will be used again somewhere else.

### Key Utility Locations

**Date Operations** - `/src/shared/utils/formatting/date.ts`:
```typescript
import { isSameDate, toDBDateValue, formatDate, formatDateTime } from '@/shared/utils/formatting/date'

// ✅ Correct: Use centralized date comparison
if (filters.date && !isSameDate(investment.fecha, filters.date)) return false

// ❌ Wrong: Manual date comparison that can cause bugs
const investmentDate = new Date(investment.fecha).toISOString().split('T')[0]
if (investmentDate !== filters.date) return false
```

**Currency & Number Formatting** - `/src/shared/utils/formatting/`:
```typescript
import { formatCurrency, formatPercentage } from '@/shared/utils/formatting'

// ✅ Consistent formatting across the app
<td>{formatCurrency(investment.monto)}</td>
<td>{formatPercentage(rate.monthly_rate)}</td>
```

**Data Type Transformations** - `/src/utils/admin-data-types.ts`:
```typescript
import { formatStudentsForClient, StudentForClient } from '@/utils/admin-data-types'

// ✅ Centralized data formatting with computed properties
const studentsForClient = formatStudentsForClient(students, investmentCounts)
```

**Server Action Patterns** - `/src/utils/server-actions.ts`:
```typescript
import { withAdminAuth, validateRequired } from '@/utils/server-actions'

// ✅ Standardized authentication and validation
export const createEntity = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['name', 'email'])
  if (missing.length > 0) throw new Error(`Missing: ${missing.join(', ')}`)
  // ... entity creation logic
}, 'create entity')
```

**Error Handling** - `/src/shared/utils/errors/`:
```typescript
import { handleError, formatErrorMessage } from '@/shared/utils/errors'

// ✅ Consistent error processing
try {
  return await operation()
} catch (error) {
  return handleError(error, 'Operation failed')
}
```

### Before Creating New Utilities

1. **Search existing solutions**: Check `/src/shared/utils/`, `/src/utils/`, and `/src/presentation/hooks/`
2. **Evaluate enhancement**: Can existing utilities be extended instead of creating new ones?
3. **Consider reusability**: Will this be used in multiple places? Create centralized solution
4. **Follow patterns**: Match existing naming conventions and file organization
5. **Update documentation**: Add to this guide if creating new architectural patterns

### Utility Organization Hierarchy

```
src/
├── shared/utils/          # 🌟 Pure, reusable functions (formatting, validation, errors)
├── utils/                 # 📊 Admin-specific utilities (data types, server actions)
├── presentation/hooks/    # 🎨 UI-focused reusable hooks (modals, tables, media queries)
└── presentation/features/*/hooks/ # 🎯 Feature-specific business logic hooks
```

## Common Pitfalls

❌ **Don't**: Use API routes for forms (except auth or third-party requirements)
❌ **Don't**: Format dates in client components (causes hydration mismatches)  
❌ **Don't**: Skip authentication wrappers in server actions
❌ **Don't**: Use string dates - always `Date` objects
❌ **Don't**: Create manual date comparisons - use `isSameDate()` from centralized utilities
❌ **Don't**: Forget to handle auth configuration errors gracefully
❌ **Don't**: Define duplicate types - use centralized utilities from `/src/utils/admin-data-types.ts`
❌ **Don't**: Create large components - follow single responsibility principle
❌ **Don't**: Reinvent existing utilities - search `/src/shared/utils/` and `/src/utils/` first

✅ **Do**: Use server actions for all form processing
✅ **Do**: Pre-format dates/currency in server components with centralized formatters
✅ **Do**: Follow standardized error handling patterns
✅ **Do**: Use repository pattern for database access
✅ **Do**: Handle missing OAuth configuration with helpful error messages
✅ **Do**: Use form auto-fill patterns for better UX
✅ **Do**: Use centralized data types and formatters from `/src/utils/admin-data-types.ts`
✅ **Do**: Extract reusable logic to hooks in `/src/presentation/hooks/`
✅ **Do**: Organize components by feature in `/src/presentation/features/`
✅ **Do**: Use centralized date utilities like `isSameDate()` for consistent filtering
✅ **Do**: Search existing utilities before creating new ones

## Documentation Structure
All detailed documentation is located in the `/documentation` and `/implementation` folders:
- `ADMIN_COMPLETE.md` - Complete admin panel implementation details
- `ADMIN_SETUP.md` - Admin panel setup guide  
- `DATABASE.md` - Database configuration and setup
- `STUDENT_AUTH_SETUP.md` - Student authentication system details
- `implementation/vcoin-refactoring-guide.md` - Complete refactoring strategy and patterns
- `PHASE_*_COMPLETION_NOTES.md` - Detailed refactoring phase documentation
- `ARCHITECTURAL_COMPLIANCE_AUDIT.md` - Architectural standards and compliance guidelines
