# VCoin Enhanced Server Actions Pattern

## Overview

VCoin has established a new enhanced pattern for server actions that provides better consistency, type safety, and developer experience. This pattern is demonstrated in `src/actions/group-actions.ts` and should be migrated across all other server action files.

## New Helper Functions

The following helper functions have been added to `@/utils/server-actions`:

### Form Parsing Utilities
- `parseFormString(formData, field)` - Parse string fields with validation
- `parseFormBoolean(formData, field, defaultValue?)` - Parse boolean fields with smart defaults
- `parseFormNumberOptional(formData, field)` - Parse optional numbers (returns null if empty)

### ActionResult Helpers
- `createActionSuccess<T>(data?, message?)` - Create standardized success responses
- `createActionError(error, code?)` - Create standardized error responses

## Pattern Comparison

### OLD PATTERN (Manual Construction)
```typescript
export const createEntity = withAdminAuth(async (formData: FormData) => {
  const field = formData.get('field') as string
  const entity = await service.create({ field })
  return entity // Returns ActionResult automatically via withAdminAuth
}, 'create entity')
```

### NEW PATTERN (With Helpers)
```typescript
export const createEntity = withAdminAuth(async (formData: FormData): Promise<ActionResult> => {
  try {
    const missing = validateRequired(formData, ['field'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const field = parseFormString(formData, 'field')
    const entity = await service.create({ field })
    return createActionSuccess(entity, 'Entity created successfully')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to create entity')
  }
}, 'create entity')
```

## Key Benefits

1. **Explicit Error Handling**: Clear try-catch blocks with meaningful error messages
2. **Consistent Parsing**: Type-safe form field parsing with proper validation
3. **Better UX**: Descriptive success and error messages for users
4. **Type Safety**: Explicit `Promise<ActionResult>` return types
5. **Maintainability**: Standardized patterns across all server actions

## Migration Checklist

When migrating existing server actions to the new pattern:

1. ✅ Add explicit `Promise<ActionResult>` return type
2. ✅ Wrap logic in try-catch block
3. ✅ Use `validateRequired()` for field validation
4. ✅ Replace manual parsing with helper functions:
   - `formData.get('field') as string` → `parseFormString(formData, 'field')`
   - `parseInt(formData.get('field')!)` → `parseFormNumber(formData, 'field')`
   - Optional numbers → `parseFormNumberOptional(formData, 'field')`
   - Boolean fields → `parseFormBoolean(formData, 'field')`
5. ✅ Replace direct returns with helper functions:
   - Success → `return createActionSuccess(data, 'Success message')`
   - Error → `return createActionError('Error message')`
6. ✅ Add descriptive error messages for different failure scenarios

## Implementation Status

- ✅ **Helper functions created** - All utilities added to `@/utils/server-actions`
- ✅ **Pattern documented** - Complete migration guide established  
- ✅ **Group actions implemented** - First implementation using new pattern
- ⏳ **Pending migration** - Investment actions, student actions, and other server actions

## Next Steps

1. Migrate `src/actions/investment-actions.ts` to new pattern
2. Migrate `src/actions/student-actions.ts` to new pattern
3. Update any remaining server action files
4. Update VCoin architectural documentation to reflect new standards

## Files Using New Pattern

- ✅ `src/actions/group-actions.ts` - Complete implementation with full documentation

## Legacy Files (To Be Migrated)

- ⏳ `src/actions/investment-actions.ts`
- ⏳ `src/actions/student-actions.ts`
- ⏳ Any other `*actions.ts` files

---

This enhanced pattern ensures consistent, maintainable, and user-friendly server actions across the entire VCoin application.
