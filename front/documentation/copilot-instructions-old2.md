# VCoin - Investment Tracking Application

VCoin is a Next.js application for tracking student investments with a comprehensive admin panel. It uses PostgreSQL, NextAuth.js v5, and follows a server-first architecture.

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
npm run setup  # Creates tables, sample data, and auth system
npm run db:test  # Verify database connectivity
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
- Server actions use `await auth()` directly (most files) or `requireAuth()` helper (classes only)
- Development mode allows any email, production uses `ADMIN_EMAILS`
- **Note**: Classes actions use `requireAuth()` helper, other admin actions use direct `auth()` calls

**Student Routes** (`/student/*`):
- Protected by `StudentSessionService` with cookie-based sessions
- Server actions check student authentication via `StudentSessionService.getSession()`

## Project-Specific Conventions

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

### Form Handling
**Server Actions with FormData** (preferred over API routes):
```typescript
// Admin actions pattern
export async function createStudent(formData: FormData) {
  const session = await auth()  // Direct auth check (most files)
  if (!session) redirect('/admin/auth/signin')
  // Process formData...
}

// Student actions pattern  
export async function updateStudentProfile(formData: FormData) {
  const session = await StudentSessionService.getSession()
  if (!session) throw new Error('Not authenticated')
  // Process formData...
}
```

**API Routes** (only for authentication or third-party requirements):
- `/api/auth/[...nextauth]` - NextAuth.js handlers
- `/api/auth/student/*` - Student login/logout endpoints

### Error Handling
**Standard patterns across the codebase:**
```typescript
// Server actions pattern
try {
  // Process formData, validate inputs
  const result = await adminService.createEntity(data)
  return { success: true, result }
} catch (error) {
  console.error('Error creating entity:', error)
  return { success: false, error: 'Failed to create entity' }
}

// Service layer pattern (ServerDataService)
try {
  return await this.service.getData()
} catch (error) {
  console.error('Database error, falling back to pseudo-db:', error)
  return fallbackData
}
```

**Key principles:**
- Server actions return `{ success: boolean, error?: string }` objects
- Services log errors and gracefully degrade (database → pseudo-db fallback)
- Client components show user-friendly error messages
- Critical operations use try-catch with specific error logging

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
