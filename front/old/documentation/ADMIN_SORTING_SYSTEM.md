# Admin Table Sorting System

## Overview

This document describes the comprehensive table sorting system implemented for VCoin admin views. The system is designed to be reusable across all admin tables, following VCoin's "don't reinvent the wheel" motto.

## Features

- **URL-based sorting**: Sort parameters are preserved in the URL for persistence across refreshes
- **Filter compatibility**: Sorting works seamlessly with existing filter and pagination systems
- **Mobile-friendly**: Includes dedicated mobile sort interface
- **Type-safe**: Full TypeScript support with proper types
- **Reusable**: One implementation that works across all admin views
- **Accessible**: Proper ARIA labels and keyboard navigation

## Quick Implementation Guide

### 1. Import Required Components and Hooks

```tsx
import { useAdminSorting, sortData, createFieldAccessor } from '@/presentation/hooks/useAdminSorting'
import ResponsiveTable from '@/components/admin/responsive-table' // Already includes sorting support
```

### 2. Initialize Sorting in Your Component

```tsx
export default function YourAdminComponent({ data, ... }) {
  // Initialize sorting with default configuration
  const { currentSort, updateSort } = useAdminSorting({
    defaultSort: { field: 'name', direction: 'asc' }, // Optional default
    preserveFilters: true // Recommended for admin views
  })
  
  // Apply filters first (existing logic)
  const filteredData = applyYourFilters(data)
  
  // Create custom field accessor for complex sorting
  const fieldAccessor = createFieldAccessor<YourDataType>({
    // Define custom accessors for computed fields
    full_name: (item) => `${item.first_name} ${item.last_name}`,
    status_text: (item) => item.active ? 'Active' : 'Inactive',
    class_name: (item) => {
      const class = classes.find(c => c.id === item.class_id)
      return class?.name || 'No class'
    }
  })
  
  // Apply sorting
  const sortedData = sortData(filteredData, currentSort, fieldAccessor)
  
  // ... rest of component
}
```

### 3. Configure Table Columns

```tsx
const columns = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,           // Enable sorting for this column
    sortField: 'name',        // Field to sort by (optional, defaults to key)
    render: (item) => item.name
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    render: (item) => item.email
  },
  {
    key: 'class',
    header: 'Class',
    sortable: true,
    sortField: 'class_name',  // Use custom field accessor
    render: (item) => {
      const class = classes.find(c => c.id === item.class_id)
      return class?.name || 'No class'
    }
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,          // Disable sorting for action columns
    render: (item) => <ActionButtons item={item} />
  }
]
```

### 4. Use ResponsiveTable with Sorting

```tsx
<ResponsiveTable
  data={sortedData}
  columns={columns}
  enableSorting={true}
  sortConfig={currentSort}
  onSort={updateSort}
  emptyMessage="No data found"
  mobileCard={customMobileCard} // Optional
/>
```

## Advanced Usage

### Custom Field Accessors

For complex sorting logic, use the `createFieldAccessor` function:

```tsx
const fieldAccessor = createFieldAccessor<Student>({
  // Sort by full name instead of separate fields
  full_name: (student) => `${student.first_name} ${student.last_name}`,
  
  // Sort by related data
  class_name: (student) => {
    const studentClass = classes.find(c => c.id === student.class_id)
    return studentClass?.name || 'zzz_no_class' // 'zzz' puts no class at end
  },
  
  // Sort by computed values
  total_investments: (student) => {
    return investments
      .filter(inv => inv.student_id === student.id)
      .reduce((sum, inv) => sum + inv.amount, 0)
  },
  
  // Sort by status
  status_priority: (student) => {
    // Custom sort order: active first, then inactive
    return student.active ? 0 : 1
  }
})
```

### Manual Sorting Without ResponsiveTable

If you need custom table implementation:

```tsx
import SortableHeader from '@/components/admin/sortable-header'
import MobileSortDropdown from '@/components/admin/mobile-sort-dropdown'

// Desktop table headers
<thead>
  <tr>
    <th>
      <SortableHeader
        field="name"
        currentSort={currentSort}
        onSort={updateSort}
      >
        Student Name
      </SortableHeader>
    </th>
    {/* ... more headers */}
  </tr>
</thead>

// Mobile sort dropdown
<MobileSortDropdown
  options={[
    { field: 'name', label: 'Name' },
    { field: 'email', label: 'Email' },
    { field: 'class_name', label: 'Class' }
  ]}
  currentSort={currentSort}
  onSort={updateSort}
/>
```

## URL Parameters

The sorting system uses these URL parameters:
- `sort`: Field to sort by
- `order`: Sort direction ('asc' or 'desc')

Example URLs:
- `/admin/students?sort=name&order=asc`
- `/admin/students?qc=1&sort=email&order=desc` (with class filter)

## Integration with Existing Systems

### Filters Compatibility

Sorting preserves all existing filter parameters by default:

```tsx
const { currentSort, updateSort } = useAdminSorting({
  preserveFilters: true // Default behavior
})
```

### Pagination Compatibility

When sorting changes, pagination automatically resets to page 1 to avoid confusion.

### Auto-refresh Compatibility

Sorting works seamlessly with the existing auto-refresh system. No additional configuration needed.

## Best Practices

### 1. Default Sorting
Always provide a sensible default sort:

```tsx
const { currentSort, updateSort } = useAdminSorting({
  defaultSort: { field: 'name', direction: 'asc' }
})
```

### 2. Logical Sort Fields
Use intuitive field names for sorting:

```tsx
const columns = [
  {
    key: 'student_info',
    header: 'Student',
    sortField: 'name', // Sort by name, not 'student_info'
    render: (student) => <StudentCard student={student} />
  }
]
```

### 3. Handle Null Values
Custom accessors should handle null/undefined values:

```tsx
const fieldAccessor = createFieldAccessor<Student>({
  class_name: (student) => {
    const studentClass = classes.find(c => c.id === student.class_id)
    return studentClass?.name || '' // Empty string sorts first
  }
})
```

### 4. Performance Considerations
For large datasets, consider server-side sorting:

```tsx
// Client-side sorting (current implementation)
const sortedData = sortData(filteredData, currentSort, fieldAccessor)

// Server-side sorting (future enhancement)
// Pass currentSort to your data fetching function
// const sortedData = await fetchSortedData(filters, currentSort)
```

## Migration Guide

### Updating Existing Admin Views

1. **Add sorting imports**:
   ```tsx
   import { useAdminSorting, sortData, createFieldAccessor } from '@/presentation/hooks/useAdminSorting'
   ```

2. **Initialize sorting**:
   ```tsx
   const { currentSort, updateSort } = useAdminSorting({
     defaultSort: { field: 'name', direction: 'asc' }
   })
   ```

3. **Update data processing**:
   ```tsx
   // Before
   const processedData = applyFilters(data)
   
   // After
   const filteredData = applyFilters(data)
   const sortedData = sortData(filteredData, currentSort, fieldAccessor)
   ```

4. **Update ResponsiveTable**:
   ```tsx
   <ResponsiveTable
     data={sortedData} // Changed from filteredData
     columns={columns}
     enableSorting={true} // Add this
     sortConfig={currentSort} // Add this
     onSort={updateSort} // Add this
   />
   ```

5. **Mark columns as sortable**:
   ```tsx
   const columns = [
     {
       key: 'name',
       header: 'Name',
       sortable: true, // Add this
       render: (item) => item.name
     }
   ]
   ```

## Testing

### Manual Testing Checklist

- [ ] Sort by each sortable column
- [ ] Toggle sort direction (asc/desc)
- [ ] Verify URL parameters update correctly
- [ ] Test with filters applied
- [ ] Test pagination reset on sort change
- [ ] Test mobile sort dropdown
- [ ] Test refresh preservation
- [ ] Test with empty data

### Example Test Cases

```tsx
// Test default sorting
expect(sortedStudents[0].name).toBe('Alice') // First alphabetically

// Test direction toggle
updateSort('name') // Should be desc now
expect(sortedStudents[0].name).toBe('Zoe') // Last alphabetically

// Test custom field accessor
updateSort('class_name')
expect(sortedStudents[0].class_id).toBe(classAId) // Class A comes first
```

## Future Enhancements

1. **Server-side sorting**: For large datasets, implement sorting at the database level
2. **Multi-column sorting**: Allow sorting by multiple columns with priority
3. **Sort persistence**: Remember user's preferred sort across sessions
4. **Custom sort orders**: Allow defining custom sort orders for specific fields

## Common Issues and Solutions

### Issue: Custom fields not sorting correctly
**Solution**: Ensure your field accessor returns consistent data types:

```tsx
// Wrong - mixed types
status: (item) => item.active ? 'Active' : 0

// Correct - consistent types
status: (item) => item.active ? 'Active' : 'Inactive'
```

### Issue: Sorting breaks with null values
**Solution**: Handle nulls in your accessor:

```tsx
email: (item) => item.email || 'zzz_no_email' // Sorts nulls last
```

### Issue: Mobile sort not showing
**Solution**: Ensure columns have `sortable: true` and check screen size.

## Component API Reference

### useAdminSorting Hook

```tsx
const {
  currentSort,     // Current sort configuration
  updateSort,      // Function to update sort
  clearSort,       // Function to clear sort
  getSortDirection,// Get direction for specific field
  isSorted,        // Check if field is currently sorted
  getUrlWithSort   // Generate URL with sort params
} = useAdminSorting(options)
```

### sortData Function

```tsx
const sortedData = sortData(
  data,              // Array to sort
  sortConfig,        // Sort configuration
  fieldAccessor      // Optional custom field accessor
)
```

### SortableHeader Component

```tsx
<SortableHeader
  field="name"           // Field to sort by
  currentSort={sort}     // Current sort state
  onSort={updateSort}    // Sort handler
  align="left"           // Optional alignment
  disabled={false}       // Optional disable state
  tooltip="Sort by name" // Optional tooltip
>
  Column Header
</SortableHeader>
```
