# VCoin Database Setup Guide

This guide will help you set up the PostgreSQL database for the VCoin application.

## Prerequisites

1. **PostgreSQL Server**: Install PostgreSQL 12 or higher
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - macOS: Use Homebrew: `brew install postgresql`
   - Linux: Use your package manager, e.g., `sudo apt-get install postgresql`

2. **Node.js**: Ensure Node.js 18+ is installed

## Quick Setup

### 1. Start PostgreSQL Service

**Windows:**
```cmd
# Start PostgreSQL service (if not already running)
net start postgresql-x64-14
```

**macOS/Linux:**
```bash
# Start PostgreSQL service
sudo service postgresql start
# or
brew services start postgresql
```

### 2. Create Database and User

Connect to PostgreSQL as superuser:

```bash
# Connect as postgres user
psql -U postgres

# Create the database
CREATE DATABASE vcoin_db;

# Create a user (optional, or use existing user)
CREATE USER vcoin_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE vcoin_db TO vcoin_user;

# Exit
\q
```

### 3. Configure Environment

1. Copy the environment example file:
   ```cmd
   copy .env.example .env.local
   ```

2. Edit `.env.local` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=vcoin_db
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   USE_DATABASE=true
   ```

### 4. Initialize Database Schema

Run the database setup script:

```cmd
npm run db:setup
```

This will:
- Create all necessary tables (classes, students, investments)
- Set up indexes and triggers
- Insert initial test data

### 5. Test the Setup

Verify everything is working:

```cmd
npm run db:test
```

You should see output confirming successful database connection and data retrieval.
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Investments
- `id` (SERIAL PRIMARY KEY)
- `student_id` (INTEGER) - Foreign key to students table
- `fecha` (DATE) - Investment date
- `monto` (NUMERIC) - Investment amount
- `concepto` (TEXT) - Investment concept/description
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Setup Instructions

### 1. PostgreSQL Installation
Install PostgreSQL on your system:
- Windows: Download from https://www.postgresql.org/download/windows/
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql postgresql-contrib`

### 2. Database Creation
Create a database for the application:
```sql
CREATE DATABASE vcoin_db;
CREATE USER vcoin_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vcoin_db TO vcoin_user;
```

### 3. Environment Configuration
Update `.env.local` with your database credentials:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vcoin_db
DB_USER=vcoin_user
DB_PASSWORD=your_password
```

### 4. Database Initialization
Run the database setup script:
```bash
npm run db:setup
```

This will:
- Create all necessary tables
- Set up indexes and triggers
- Seed the database with initial data from pseudo-db

## Architecture

### Repository Layer
- `ClassRepository` - Handles class CRUD operations
- `StudentRepository` - Handles student CRUD operations
- `InvestmentRepository` - Handles investment CRUD operations

### Service Layer
- `InvestmentService` - Business logic for all operations
- Validates relationships between entities
- Provides calculated fields and aggregations

### Data Access
- `montos-repo.ts` - Updated to use database with fallback to pseudo-db
- Maintains backward compatibility with existing components

### React Integration
- `DatabaseProvider` - React context for database access
- `useDatabase` - Hook for accessing database service
- `useInvestments` - Hook for fetching investment data

## Migration Status

### Completed ✅
- Database schema design
- Repository layer implementation
- Service layer with business logic
- Database initialization and seeding
- Backward compatibility for existing components

### TODO 📋
- Update React components to use async data fetching
- Implement proper error handling in UI
- Add loading states to components
- Create admin interface for managing data
- Add authentication and user sessions
- Implement multi-student support

## Current Limitations

1. **Single Student Mode**: Currently hardcoded to work with student ID 1
2. **Synchronous Compatibility**: Uses caching to maintain sync API for existing components
3. **No Authentication**: All data access assumes a single user
4. **Error Handling**: Basic error handling, needs improvement for production

## Usage Examples

### Service Layer
```typescript
import { InvestmentService } from '@/services/investment-service';

const service = new InvestmentService();

// Create new investment
const investment = await service.createInvestment({
  student_id: 1,
  fecha: '2025-07-17',
  monto: 50000,
  concepto: 'Final exam'
});

// Get student with investments
const studentData = await service.getStudentWithInvestments(1);
```

### React Hooks
```typescript
import { useInvestments } from '@/hooks/useDatabase';

function MyComponent() {
  const { investments, totalInvested, loading } = useInvestments(1);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <p>Total: {totalInvested}</p>
      {investments.map(inv => (
        <div key={inv.id}>{inv.concepto}: {inv.monto}</div>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running
2. Check credentials in `.env.local`
3. Verify database exists and user has permissions

### Migration Issues
1. Check console for error messages
2. Ensure `tsx` is installed: `npm install --save-dev tsx`
3. Run `npm run db:setup` to reinitialize

### Component Issues
1. Current components use cached data as fallback
2. Check browser console for database connection errors
3. Components will work with pseudo-db if database is unavailable
