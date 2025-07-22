# VCoin Investment Tracking - AI Coding Agent Guidelines

VCoin is a Next.js 15 investment tracking application for students with dual authentication systems and server-first architecture. This guide focuses on project-specific patterns and architectural decisions that differ from standard Next.js applications.

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
Date and currency formatting is done in the server components using the hybrid approach, ensuring consistent data types and preventing hydration mismatches.

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

### Date and Currency Formatting Pattern (CRITICAL)
**Server-Side Formatting to Prevent Hydration Mismatches:**

```typescript
// 1. Use the hybrid formatting utility
import { withFormattedDates, DateFieldSets, WithFormattedDates } from '@/utils/format-dates'

// 2. In server components (page.tsx)
const classes = await adminService.getAllClasses()
const classesForClient = withFormattedDates(classes, [...DateFieldSets.CLASS_FIELDS])

// 3. Define client types with formatted fields
type ClassForClient = WithFormattedDates<Class, 'end_date' | 'created_at' | 'updated_at'>

// 4. Pass to client component
<ClassesAdminClient initialClasses={classesForClient as unknown as ClassForClient[]} />
```

**Benefits of this approach:**
- ✅ Prevents hydration mismatches (server/client render exactly the same)
- ✅ Keeps original `Date` objects for calculations and logic
- ✅ Provides pre-formatted strings for display (`field_name_formatted`)
- ✅ DRY principle - one utility works for all entities
- ✅ Type safety with `WithFormattedDates<T, K>` helper

**Available DateFieldSets:**
```typescript
DateFieldSets.CLASS_FIELDS = ['end_date', 'created_at', 'updated_at']
DateFieldSets.INVESTMENT_FIELDS = ['fecha', 'created_at', 'updated_at']  
DateFieldSets.AUDIT_FIELDS = ['created_at', 'updated_at']
DateFieldSets.INTEREST_RATE_FIELDS = ['effective_date', 'created_at', 'updated_at']
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
- **New calculations**: Extend `/src/logic/calculations.ts` with proper date handling
- **Database changes**: Update `/src/scripts/init-database.sql` and run setup
- **Student password management**: Use admin panel or `StudentAuthService` methods
- **New admin features**: Create `page.tsx` (server), `*-admin-client.tsx` (client), `actions.ts` (forms)
- **New server actions**: Use `withAdminAuth()` or `withStudentAuth()` wrappers from `/src/utils/server-actions.ts`

## Key Development Workflows

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

### Adding New Features
1. **Entity**: Define in `/src/types/database.ts`
2. **Repository**: CRUD operations in `/src/repos/`
3. **Service**: Business logic in `/src/services/`
4. **Server Component**: `page.tsx` with auth + data fetching
5. **Client Component**: `*-admin-client.tsx` with forms
6. **Server Actions**: `actions.ts` with `withAdminAuth`/`withStudentAuth` wrappers

## Common Pitfalls

❌ **Don't**: Use API routes for forms (except auth or third-party requirements)
❌ **Don't**: Format dates in client components (causes hydration mismatches)  
❌ **Don't**: Skip authentication wrappers in server actions
❌ **Don't**: Use string dates - always `Date` objects
❌ **Don't**: Forget to handle auth configuration errors gracefully

✅ **Do**: Use server actions for all form processing
✅ **Do**: Pre-format dates/currency in server components with `withFormattedDates`
✅ **Do**: Follow standardized error handling patterns
✅ **Do**: Use repository pattern for database access
✅ **Do**: Handle missing OAuth configuration with helpful error messages
✅ **Do**: Use form auto-fill patterns for better UX

## Documentation Structure
All detailed documentation is located in the `/documentation` folder:
- `ADMIN_COMPLETE.md` - Complete admin panel implementation details
- `ADMIN_SETUP.md` - Admin panel setup guide  
- `DATABASE.md` - Database configuration and setup
- `STUDENT_AUTH_SETUP.md` - Student authentication system details
