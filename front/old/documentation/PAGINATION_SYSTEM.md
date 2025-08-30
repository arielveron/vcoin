# VCoin Pagination System

## Overview

This document describes the reusable pagination system implemented for VCoin's admin interface. The system follows the "don't reinvent the wheel" motto by creating modular, reusable components that can be used across all admin views.

## Architecture

The pagination system consists of several layers following VCoin's architectural patterns:

### 1. Components Layer (`src/components/admin/`)

#### `Pagination` Component
- **Location**: `src/components/admin/pagination.tsx`
- **Purpose**: Reusable pagination UI component with mobile-responsive design
- **Features**:
  - Smart page number display with ellipsis
  - Mobile-friendly Previous/Next buttons
  - Accessibility support (ARIA labels)
  - Consistent styling with VCoin design system

#### `PageSizeSelector` Component  
- **Location**: `src/components/admin/page-size-selector.tsx`
- **Purpose**: Allows users to change items per page
- **Features**:
  - Configurable options (default: 5, 10, 25, 50, 100)
  - Consistent styling with form controls
  - Spanish language labels

### 2. Hooks Layer (`src/presentation/hooks/`)

#### `usePagination` Hook
- **Location**: `src/presentation/hooks/usePagination.ts`
- **Purpose**: URL-based pagination state management
- **Features**:
  - Maintains pagination state in URL parameters
  - Bookmarkable URLs with pagination state
  - Configurable parameter names
  - Automatic URL updates without page refresh

#### `useDataTableWithPagination` Hook
- **Location**: `src/presentation/hooks/useDataTableWithPagination.ts`  
- **Purpose**: Complete client-side pagination solution
- **Features**:
  - Combines data filtering, sorting, and pagination
  - Works with existing `useDataTable` patterns
  - Optimized for smaller datasets
  - Automatic pagination reset on filter changes

### 3. Repository Layer (`src/repos/`)

#### Enhanced `StudentRepository`
- **New Methods**:
  - `findPaginated(page, limit, classId?)`: Server-side paginated results
  - `getCount(classId?)`: Total count for pagination calculation
- **Features**:
  - Efficient SQL queries with LIMIT/OFFSET
  - Optional filtering by class
  - Consistent error handling

### 4. Service Layer (`src/services/`)

#### Enhanced `AdminService`  
- **New Methods**:
  - `getStudentsPaginated(page, limit, classId?)`: Business logic wrapper
  - `getStudentsCount(classId?)`: Count wrapper with validation
- **Features**:
  - Calculates total pages automatically
  - Maintains consistent interface patterns
  - Input validation and error handling

## Usage Examples

### Basic Server-Side Pagination

```tsx
// In a server component (page.tsx)
export default async function StudentsPage({ searchParams }) {
  const page = parseInt(searchParams.page || '1')
  const size = parseInt(searchParams.size || '10')
  
  const { students, total, totalPages } = await adminService.getStudentsPaginated(page, size)
  
  return (
    <StudentsPage 
      initialStudents={students}
      totalStudents={total}
      totalPages={totalPages}
      currentPage={page}
      pageSize={size}
    />
  )
}
```

### Client Component with Pagination

```tsx
// In a client component
import { usePagination } from '@/presentation/hooks'
import Pagination from '@/components/admin/pagination'
import PageSizeSelector from '@/components/admin/page-size-selector'

export default function MyAdminView({ data, totalItems }) {
  const { currentPage, itemsPerPage, goToPage, changeItemsPerPage } = usePagination()
  
  return (
    <div>
      {/* Your data display */}
      
      <PageSizeSelector 
        currentPageSize={itemsPerPage}
        onPageSizeChange={changeItemsPerPage}
      />
      
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={goToPage}
      />
    </div>
  )
}
```

### Client-Side Pagination (Small Datasets)

```tsx
import { useDataTableWithPagination } from '@/presentation/hooks'

export default function MyTable({ data }) {
  const {
    data: paginatedData,
    totalItems,
    totalPages,
    currentPage,
    goToPage,
    changeItemsPerPage
  } = useDataTableWithPagination({
    data,
    columns: [], // Define your columns
    filterFn: (item) => /* your filter logic */,
    defaultItemsPerPage: 10
  })
  
  return (
    <div>
      <Table data={paginatedData} />
      <Pagination /* props */ />
    </div>
  )
}
```

## URL Parameters

The pagination system uses these URL parameters:

- `page`: Current page number (default: 1, omitted from URL if 1)
- `size`: Items per page (default: 10, omitted if default)

Example URLs:
- `/admin/students` - First page, default size
- `/admin/students?page=3` - Page 3, default size  
- `/admin/students?page=2&size=25` - Page 2, 25 items per page

## Performance Considerations

### Server-Side Pagination (Recommended for Large Datasets)
- ✅ Efficient memory usage
- ✅ Fast initial load times
- ✅ Scales with dataset size
- ✅ SEO-friendly URLs
- ❌ Requires server round-trips

### Client-Side Pagination (Good for Small Datasets)  
- ✅ Instant page changes
- ✅ Works offline
- ✅ No server round-trips
- ❌ Memory usage grows with data
- ❌ Slower initial load for large datasets

## Extensibility

The pagination system is designed to be easily extended:

### Adding to New Views

1. **Server Component**: Use `adminService.getDataPaginated()` pattern
2. **Repository**: Add `findPaginated()` and `getCount()` methods
3. **Client Component**: Import and use pagination components
4. **URL Params**: Follow existing parameter conventions

### Customization Options

- **Page sizes**: Configure via `PageSizeSelector` options prop
- **Parameter names**: Configure via `usePagination` options
- **Styling**: Override CSS classes in components
- **Language**: Update labels in component strings

## Testing Considerations

- Test pagination with various dataset sizes
- Test URL parameter handling and bookmarking
- Test mobile responsiveness
- Test accessibility features
- Test edge cases (empty data, single page)

## Migration Guide

To add pagination to existing admin views:

1. **Update Repository** (if using server-side pagination):
   ```typescript
   // Add to your repository
   async findPaginated(page: number, limit: number, filters?: any) {
     // Implementation similar to StudentRepository
   }
   ```

2. **Update Service**:
   ```typescript
   // Add to your service  
   async getDataPaginated(page: number, limit: number, filters?: any) {
     // Implementation similar to AdminService
   }
   ```

3. **Update Server Component**:
   ```typescript
   // Parse pagination params and use paginated methods
   const page = parseInt(searchParams.page || '1')
   const size = parseInt(searchParams.size || '10')
   ```

4. **Update Client Component**:
   ```typescript
   // Import and use pagination components
   import Pagination from '@/components/admin/pagination'
   import { usePagination } from '@/presentation/hooks'
   ```

This system provides a robust, scalable foundation for pagination across all VCoin admin interfaces.
