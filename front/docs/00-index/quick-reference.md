# Quick Reference - VCoin

## Por Problema/Necesidad

### "No sé dónde está X utilidad"
→ [04-utilities/centralized-utilities.md](../04-utilities/centralized-utilities.md)

### "Error de hidratación en la consola"
→ [08-troubleshooting/hydration-errors.md](../08-troubleshooting/hydration-errors.md)

### "No sé desde dónde importar algo"
→ [02-conventions/import-paths.md](../02-conventions/import-paths.md)

### "Necesito agregar una nueva entidad/feature"
→ [03-workflows/new-feature.md](../03-workflows/new-feature.md)

### "Cómo crear un server action"
→ [03-workflows/server-actions.md](../03-workflows/server-actions.md)

### "Qué hook usar para X"
→ [04-utilities/hooks-catalog.md](../04-utilities/hooks-catalog.md)

### "Dónde va este código"
→ [01-architecture/patterns.md](../01-architecture/patterns.md#responsabilidades-por-capa)

### "TypeScript error extraño"
→ [08-troubleshooting/typescript-errors.md](../08-troubleshooting/typescript-errors.md)

## Ubicaciones Rápidas

### Utilidades de Formateo
```typescript
import { formatCurrency, formatDate, formatPercentage } from '@/shared/utils/formatting'
import { isSameDate } from '@/shared/utils/formatting/date'
```

### Server Action Helpers
```typescript
import { 
  withAdminAuth,
  validateRequired,
  parseFormString,
  parseFormNumber,
  createActionSuccess,
  createActionError
} from '@/utils/server-actions'
```

### Tipos Admin
```typescript
import { StudentForClient, formatStudentsForClient } from '@/utils/admin-data-types'
import { ActionResult } from '@/utils/admin-server-action-types'
```

### Hooks Comunes
```typescript
import { 
  useServerAction,
  useAutoRefresh,
  useFormModal,
  usePagination,
  useMediaQuery
} from '@/presentation/hooks'
```

### Repositorios
```typescript
import { StudentRepository } from '@/repos/student-repo'
import { InvestmentRepository } from '@/repos/investment-repo'
```

### Servicios
```typescript
import { AdminService } from '@/services/admin-service'
import { StudentAuthService } from '@/services/student-auth-service'
```

## Patrones Clave

### Server Action Patrón
```typescript
export const createEntity = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Entity>> => {
  try {
    const missing = validateRequired(formData, ['field'])
    if (missing.length > 0) {
      return createActionError(`Missing: ${missing.join(', ')}`)
    }
    
    const field = parseFormString(formData, 'field')
    const result = await service.create({ field })
    return createActionSuccess(result, 'Created successfully')
  } catch (error) {
    return createActionError(error.message)
  }
}, 'create entity')
```

### Client Component con Auto-refresh
```typescript
const { refreshAfterFormAction, isPending } = useAutoRefresh()

const handleCreate = async (formData: FormData) => {
  const result = await refreshAfterFormAction(
    createEntity,
    formData,
    'Success message'
  )
  if (result.success) {
    closeModal()
  }
}
```

### Formateo Server-side
```typescript
// En page.tsx (server component)
const students = await adminService.getAllStudents()
const studentsForClient = formatStudentsForClient(students)

// Pasa al client component
<StudentsClient students={studentsForClient} />
```

### Repository Pattern
```typescript
async findAll(): Promise<Entity[]> {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT * FROM entities')
    return result.rows
  } finally {
    client.release()
  }
}
```

## Comandos Frecuentes

```bash
npm run setup          # Setup completo DB + auth
npm run dev           # Desarrollo
npm run build         # Verificar errores
npm run db:test       # Test conexión DB
```

## Checklist Pre-commit

- [ ] No hay formateo de fechas en cliente
- [ ] Todos los imports usan `@/`
- [ ] Server actions retornan ActionResult
- [ ] No hay `any` types
- [ ] No hay console.log en producción
- [ ] Se usa utilidad existente (no reinventada)

## Errores Comunes y Soluciones

### "Hydration mismatch"
**Causa**: Formateo de fecha/hora en cliente
**Solución**: Formatear en servidor con `formatDate()`

### "Cannot find module '@/...'"
**Causa**: Path incorrecto después de @/
**Solución**: Verificar que existe en src/

### "ActionResult not defined"
**Causa**: Import incorrecto
**Solución**: `import { ActionResult } from '@/utils/admin-server-action-types'`

### "undefined is not an object"
**Causa**: Acceso a propiedad sin verificar null
**Solución**: Optional chaining `object?.property`

## Flujo de Trabajo Típico

### Agregar CRUD para Nueva Entidad
1. **DB**: Crear tabla en `/src/scripts/init-database.sql`
2. **Types**: Agregar en `/src/types/database.ts`
3. **Repo**: Crear `/src/repos/entity-repo.ts`
4. **Service**: Agregar métodos en AdminService
5. **Page**: Crear `/src/app/admin/entities/page.tsx`
6. **Client**: Crear `entities-admin-client.tsx`
7. **Actions**: Crear `actions.ts`
8. **Nav**: Agregar link en admin-nav

### Agregar Nueva Utilidad
1. **Buscar**: ¿Ya existe algo similar?
2. **Ubicar**: 
   - Pura → `/src/shared/utils/`
   - Hook → `/src/presentation/hooks/`
   - Admin → `/src/utils/`
3. **Crear**: Seguir patrones existentes
4. **Exportar**: Agregar a index.ts
5. **Documentar**: Actualizar utility docs

## Arquitectura en 1 Minuto

```
┌─────────────┐
│   Client    │ (React Components)
└──────┬──────┘
       ↓ FormData
┌─────────────┐
│Server Action│ (withAdminAuth wrapper)
└──────┬──────┘
       ↓ Parsed data
┌─────────────┐
│   Service   │ (Business logic)
└──────┬──────┘
       ↓ Validated data
┌─────────────┐
│ Repository  │ (Database queries)
└──────┬──────┘
       ↓ SQL
┌─────────────┐
│  Database   │ (PostgreSQL)
└─────────────┘
```

## Links Directos a Documentación Crítica

- [No reinventes la rueda - Utilidades](../04-utilities/centralized-utilities.md)
- [Cómo agregar features](../03-workflows/new-feature.md)
- [Server actions correctos](../03-workflows/server-actions.md)
- [Arquitectura y responsabilidades](../01-architecture/patterns.md)
- [Solución hidratación](../08-troubleshooting/hydration-errors.md)