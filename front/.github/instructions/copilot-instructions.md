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
- `npm run setup` - Complete database and admin setup
- Use server actions instead of API routes for forms

### Authentication Flow
NextAuth.js v5 with Google OAuth + email whitelist:
- All `/admin/*` routes require authentication
- Server actions include `requireAuth()` helper
- Development mode allows any email, production uses `ADMIN_EMAILS`

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
- Client components: `*-admin-client.tsx`
- Server actions: `actions.ts`
- Types: Centralized in `/src/types/database.ts`

### Form Handling
Always use Server Actions with FormData:
```typescript
// actions.ts
export async function createStudent(formData: FormData) {
  await requireAuth()
  const adminService = new AdminService()
  // Process formData...
}
```

### Error Handling
- Database fallback: ServerDataService automatically switches to pseudo-db if PostgreSQL unavailable
- Graceful degradation in components when data is missing
- Loading states and user feedback in forms

## Key Integration Points

### Database Connection
- Connection pool in `/src/config/database.ts`
- Auto-reconnection and timeout handling
- Environment variables for credentials

### Interest Rate System
- Historical tracking with effective dates
- Automatic rate application based on investment dates
- Complex compound interest calculations (monthly/daily/seconds)

### Admin Filtering
Custom hook `useAdminFilters` for cross-page state:
- Class/Student filtering across all admin pages
- URL parameter persistence
- Filter badges component for UX

### Internationalization
Basic translation system in `/src/config/translations.ts` with `es-AR` focus.

## Critical Dependencies
- **NextAuth.js v5**: Latest beta with PostgreSQL adapter
- **pg**: Direct PostgreSQL client with connection pooling
- **date-fns**: Date calculations and formatting
- **Tailwind CSS**: Consistent admin panel styling

## Common Tasks
- **Adding new entities**: Follow the Repository → Service → Admin Client → Actions pattern
- **Interest rate changes**: Use admin panel, automatic historical tracking
- **New calculations**: Extend `/src/logic/calculations.ts` with proper date handling
- **Database changes**: Update `/src/scripts/init-database.sql` and run setup
