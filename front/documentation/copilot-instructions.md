# VCoin - Investment Tracking Application

VCoin is a Next.js application for tracking student investments with a comprehensive admin panel. It uses PostgreSQL, NextAuth.js v5, and follows a server-first architecture with standardized error handling and authentication patterns.

## Architecture Overview

### Core Structure
- **Main App**: Student-facing investment dashboard (`/`) with real-time calculations
- **Admin Panel**: Complete CRUD management for classes, students, investments, and interest rates (`/admin`)
- **Database-First**: PostgreSQL with connection pooling, fallback to pseudo-db for development
- **Server Components**: Data fetching happens server-side, client components handle UI interactions

### Key Patterns

#### Repository Pattern
Service → Repository → Database layers:
```typescript
AdminService → StudentRepository → Database
AdminService → InvestmentRepository → Database
```

#### Server/Client Component Split
- **Server Components** (`page.tsx`): Authentication, data fetching, initial props
- **Client Components** (`*-admin-client.tsx`): Forms, state management, UI interactions
- **Server Actions** (`actions.ts`): Form processing with authentication checks
This project never uses API routes except for authentication or if required by third-party libraries.
The connection to the database is always through server actions.
Date and currency handling is done in the server components, ensuring consistent data types.

#### Interest Rate Calculations
Complex financial calculations in `/src/logic/calculations.ts`:
- Monthly → Daily → Seconds conversion for compound interest
- Historical rate tracking with effective dates
- End-date finalization vs. real-time calculations

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
- `npm run db:test` - Verify database connectivity
- `npm run db:init` - Alternative database initialization
- Use server actions instead of API routes for forms

### Authentication Flow
**Dual Authentication System:**
- **Admin Auth**: NextAuth.js v5 with Google OAuth + email whitelist
- **Student Auth**: Custom bcrypt-based system with class_id/registro/password

**Admin Routes** (`/admin/*`):
- Protected by middleware and session checks
- Server actions use standardized `withAdminAuth()` wrapper
- Development mode allows any email, production uses `ADMIN_EMAILS`

**Student Routes** (`/student/*`):
- Protected by `StudentSessionService` with cookie-based sessions
- Server actions use standardized `withStudentAuth()` wrapper

## Project-Specific Conventions

### Standardized Server Actions
**All server actions now use consistent patterns:**
```typescript
// Import the utilities
import { withAdminAuth, validateRequired, parseFormNumber } from '@/utils/server-actions'

// Admin actions pattern
export const createEntity = withAdminAuth(async (formData: FormData) => {
  const missing = validateRequired(formData, ['field1', 'field2'])
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
  
  const field1 = formData.get('field1') as string
  const field2 = parseFormNumber(formData, 'field2')
  
  return await service.createEntity({ field1, field2 })
}, 'create entity')

// Student actions pattern  
export const updateProfile = withStudentAuth(async (formData: FormData) => {
  // validation and logic here
  return await service.updateProfile(data)
}, 'update profile')
```

**Standard Response Format:**
```typescript
// Success response
{ success: true, data?: any, message?: string }

// Error response  
{ success: false, error: string, code?: string }
```

**API Routes** (only for authentication or third-party requirements):
- `/api/auth/[...nextauth]` - NextAuth.js handlers
- `/api/auth/student/*` - Student login/logout endpoints

### Data Types
- **Dates**: Always use `Date` objects, not strings (PostgreSQL handles conversion)
- **Currency**: Integer storage (cents), formatted display with `es-AR` locale
- **Registry Numbers**: Student identification system via `registro` field

### Formatting Standards
- **Currency**: `es-AR` locale with ARS symbol
- **Dates**: `es-AR` format (DD/MM/YYYY)
- **Percentages**: 2 decimal places with % symbol

### File Naming
- Server components: `page.tsx`
- Client components: `*-admin-client.tsx` or `*-student-*.tsx`
- Server actions: `actions.ts` (admin) or `/src/actions/*-actions.ts` (student/investment)
- Types: Centralized in `/src/types/database.ts`
- **Utilities**: `/src/utils/server-actions.ts` for standardized patterns

### Standardized Error Handling
**Consistent patterns across the codebase:**
```typescript
// Server actions automatically handle errors via withAdminAuth/withStudentAuth wrappers
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

## Key Integration Points

### Dual Authentication Systems
**Admin Authentication:**
- NextAuth.js v5 with PostgreSQL adapter
- Google OAuth with email/domain whitelist
- Session-based with database storage

**Student Authentication:**
- Custom bcrypt system (12 salt rounds)
- Login throttling with exponential backoff
- Cookie-based sessions with `StudentSessionService`
- Password management by admins, profile updates by students

### Database Connection
- Connection pool in `/src/config/database.ts`
- Auto-reconnection and timeout handling
- Environment variables for credentials
- Fallback to pseudo-db for development if PostgreSQL unavailable

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
- Session creation via `StudentSessionService`

**Password Management:**
- Admins set initial passwords via admin panel
- Students change passwords in `/student/profile`
- bcrypt hashing with 12 salt rounds
- Current password verification for changes

### Internationalization
Basic translation system in `/src/config/translations.ts` with `es-AR` focus.

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
- **New calculations**: Extend `/src/logic/calculations.ts` with proper date handling
- **Database changes**: Update `/src/scripts/init-database.sql` and run setup
- **Student password management**: Use admin panel or `StudentAuthService` methods
- **New admin features**: Create `page.tsx` (server), `*-admin-client.tsx` (client), `actions.ts` (forms)
- **New server actions**: Use `withAdminAuth()` or `withStudentAuth()` wrappers from `/src/utils/server-actions.ts`

## Documentation Structure
All documentation files are located in the `/documentation` folder:
- `ADMIN_COMPLETE.md` - Complete admin panel implementation details
- `ADMIN_SETUP.md` - Admin panel setup guide  
- `DATABASE.md` - Database configuration and setup
- `STUDENT_AUTH_SETUP.md` - Student authentication system details
