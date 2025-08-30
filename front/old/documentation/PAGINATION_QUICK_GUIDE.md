# Quick Pagination Implementation Guide

This guide shows how to quickly add pagination to any admin view in VCoin.

## Step-by-Step Implementation

### 1. Repository Layer (for server-side pagination)

Add pagination methods to your repository:

```typescript
// Example: InvestmentRepository
async findPaginated(page: number, limit: number, filters?: { 
  studentId?: number, 
  categoryId?: number 
}): Promise<{ investments: Investment[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    const whereConditions = [];
    const params: any[] = [limit, offset];
    let paramIndex = 3;

    // Build dynamic WHERE clause
    if (filters?.studentId) {
      whereConditions.push(`student_id = $${paramIndex++}`);
      params.push(filters.studentId);
    }
    if (filters?.categoryId) {
      whereConditions.push(`category_id = $${paramIndex++}`);
      params.push(filters.categoryId);
    }

    const whereClause = whereConditions.length > 0 ? 
      `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM investments ${whereClause}`;
    const countResult = await client.query(countQuery, params.slice(2));
    const total = parseInt(countResult.rows[0].total, 10);

    // Get paginated data
    const dataQuery = `
      SELECT * FROM investments 
      ${whereClause}
      ORDER BY created_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const dataResult = await client.query(dataQuery, params);

    return { investments: dataResult.rows, total };
  } finally {
    client.release();
  }
}

async getCount(filters?: { studentId?: number, categoryId?: number }): Promise<number> {
  // Similar implementation for count only
}
```

### 2. Service Layer

Add pagination methods to your service:

```typescript
// Example: AdminService
async getInvestmentsPaginated(
  page: number, 
  limit: number, 
  filters?: { studentId?: number, categoryId?: number }
): Promise<{ investments: Investment[]; total: number; totalPages: number }> {
  const result = await this.investmentRepo.findPaginated(page, limit, filters);
  return {
    ...result,
    totalPages: Math.ceil(result.total / limit)
  };
}
```

### 3. Server Component (page.tsx)

Update your page component to handle pagination parameters:

```typescript
// app/admin/investments/page.tsx
interface InvestmentsPageProps {
  searchParams: Promise<{ 
    page?: string,
    size?: string,
    student?: string,
    category?: string
    // ... other filters
  }>
}

export default async function InvestmentsAdminPage({ searchParams }: InvestmentsPageProps) {
  const params = await searchParams;
  
  // Parse pagination parameters
  const page = parseInt(params.page || '1');
  const size = parseInt(params.size || '10');
  
  // Parse filter parameters
  const studentId = params.student ? parseInt(params.student) : undefined;
  const categoryId = params.category ? parseInt(params.category) : undefined;
  
  // Get paginated data
  const { investments, total, totalPages } = await adminService.getInvestmentsPaginated(
    page, 
    size, 
    { studentId, categoryId }
  );
  
  return (
    <InvestmentsPage
      initialInvestments={investments}
      totalInvestments={total}
      totalPages={totalPages}
      currentPage={page}
      pageSize={size}
      // ... other props
    />
  );
}
```

### 4. Component Props Interface

Update your props interface:

```typescript
// utils/admin-server-action-types.ts
export interface InvestmentsPageProps {
  initialInvestments: Investment[]
  totalInvestments?: number
  totalPages?: number
  currentPage?: number
  pageSize?: number
  // ... other props
}
```

### 5. Client Component

Update your client component to use pagination:

```typescript
// presentation/features/admin/investments/InvestmentsPage.tsx
import Pagination from '@/components/admin/pagination'
import PageSizeSelector from '@/components/admin/page-size-selector'
import { usePagination } from '@/presentation/hooks'

export default function InvestmentsPage({
  initialInvestments,
  totalInvestments,
  totalPages: serverTotalPages,
  currentPage: serverCurrentPage,
  pageSize: serverPageSize,
  // ... other props
}: InvestmentsPageProps) {
  
  const { currentPage, itemsPerPage, goToPage, changeItemsPerPage } = usePagination({
    defaultItemsPerPage: serverPageSize || 10
  });

  // Use server data when available, fallback to client state
  const effectiveCurrentPage = serverCurrentPage || currentPage;
  const effectiveItemsPerPage = serverPageSize || itemsPerPage;
  const effectiveTotalPages = serverTotalPages || Math.ceil((totalInvestments || initialInvestments.length) / effectiveItemsPerPage);
  const effectiveTotalItems = totalInvestments || initialInvestments.length;

  return (
    <div>
      {/* Your existing content */}
      
      {/* Results summary and page size selector */}
      <div className="flex justify-between items-center bg-white px-4 py-3 border-t">
        <div className="text-sm text-gray-700">
          Mostrando {((effectiveCurrentPage - 1) * effectiveItemsPerPage) + 1} a{' '}
          {Math.min(effectiveCurrentPage * effectiveItemsPerPage, effectiveTotalItems)} de{' '}
          {effectiveTotalItems} inversiones
        </div>
        <PageSizeSelector
          currentPageSize={effectiveItemsPerPage}
          onPageSizeChange={changeItemsPerPage}
        />
      </div>

      {/* Your data table */}
      <InvestmentsTable investments={initialInvestments} />

      {/* Pagination */}
      <Pagination
        currentPage={effectiveCurrentPage}
        totalPages={effectiveTotalPages}
        totalItems={effectiveTotalItems}
        itemsPerPage={effectiveItemsPerPage}
        onPageChange={goToPage}
      />
    </div>
  );
}
```

## Quick Copy-Paste Templates

### Repository Pagination Method Template

```typescript
async findPaginated(page: number, limit: number, filters?: YourFiltersType): Promise<{ data: YourType[]; total: number }> {
  const client = await pool.connect();
  try {
    const offset = (page - 1) * limit;
    // TODO: Build your WHERE clause based on filters
    // TODO: Get total count
    // TODO: Get paginated data with LIMIT/OFFSET
    // TODO: Return { data, total }
  } finally {
    client.release();
  }
}
```

### Service Pagination Method Template

```typescript
async getYourDataPaginated(page: number, limit: number, filters?: YourFiltersType): Promise<{ data: YourType[]; total: number; totalPages: number }> {
  const result = await this.yourRepo.findPaginated(page, limit, filters);
  return { ...result, totalPages: Math.ceil(result.total / limit) };
}
```

### Component Pagination Template

```typescript
const { currentPage, itemsPerPage, goToPage, changeItemsPerPage } = usePagination();

// Calculate effective values
const effectiveCurrentPage = serverCurrentPage || currentPage;
const effectiveItemsPerPage = serverPageSize || itemsPerPage;
const effectiveTotalPages = serverTotalPages || Math.ceil(totalItems / effectiveItemsPerPage);

// In your render
<PageSizeSelector currentPageSize={effectiveItemsPerPage} onPageSizeChange={changeItemsPerPage} />
<Pagination currentPage={effectiveCurrentPage} totalPages={effectiveTotalPages} /* ... */ />
```

## Checklist for Implementation

- [ ] Add `findPaginated()` method to repository
- [ ] Add `getCount()` method to repository  
- [ ] Add pagination methods to service layer
- [ ] Update page component to parse `page` and `size` parameters
- [ ] Update component props interface
- [ ] Import pagination components in client component
- [ ] Add pagination UI to component render
- [ ] Test with various page sizes and filters
- [ ] Verify URL state management works correctly

## Common Gotchas

1. **Parameter Parsing**: Always provide defaults for page and size
2. **Zero Results**: Handle empty result sets gracefully
3. **Filter Reset**: Reset to page 1 when filters change
4. **URL State**: Use the `usePagination` hook for consistent URL handling
5. **Performance**: Use server-side pagination for datasets > 100 items

## Need Help?

- Check the `StudentsPage` implementation as a reference
- Review `PAGINATION_SYSTEM.md` for detailed architecture info
- Look at existing pagination usage patterns in the codebase
