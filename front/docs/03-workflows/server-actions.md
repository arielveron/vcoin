# Workflow: Server Actions

## Cuándo usar este documento
Al crear o modificar cualquier server action en VCoin. TODOS los server actions deben seguir este patrón.

## Principio fundamental
Server actions SIEMPRE retornan `ActionResult<T>` y SIEMPRE usan wrappers de autenticación.

## Anatomía de un Server Action

### Estructura Base
```typescript
'use server'

import { withAdminAuth, validateRequired, parseFormString, parseFormNumber, parseFormBoolean } from '@/utils/server-actions'
import { createActionSuccess, createActionError } from '@/utils/server-actions'
import type { ActionResult } from '@/utils/admin-server-action-types'

export const actionName = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<ReturnType>> => {
  try {
    // 1. Validación
    const missing = validateRequired(formData, ['field1', 'field2'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    // 2. Parseo con helpers
    const field1 = parseFormString(formData, 'field1')
    const field2 = parseFormNumber(formData, 'field2')
    const field3 = parseFormBoolean(formData, 'field3', false) // con default
    const field4 = parseFormNumberOptional(formData, 'field4') // puede ser null

    // 3. Lógica de negocio
    const result = await service.doSomething({ field1, field2, field3, field4 })

    // 4. Retorno exitoso
    return createActionSuccess(result, 'Operation completed successfully')
  } catch (error) {
    // 5. Manejo de errores
    return createActionError(
      error instanceof Error ? error.message : 'Operation failed'
    )
  }
}, 'action name for logs')
```

## Tipos de Server Actions

### 1. Admin Actions
```typescript
// En /src/app/admin/[entity]/actions.ts

export const createEntity = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Entity>> => {
  // ... implementación
}, 'create entity')
```

### 2. Student Actions  
```typescript
// En /src/actions/student-actions.ts

export const updateProfile = withStudentAuth(async (
  formData: FormData
): Promise<ActionResult<StudentProfile>> => {
  // ... implementación
}, 'update profile')
```

### 3. Public Actions (raras)
```typescript
// Solo para acciones verdaderamente públicas

export const publicAction = withErrorHandling(async (
  formData: FormData
): Promise<ActionResult<Data>> => {
  // ... implementación
}, 'public action')
```

## Helpers de Parseo

### parseFormString
```typescript
// Siempre retorna string, lanza error si no existe
const name = parseFormString(formData, 'name')
```

### parseFormNumber
```typescript
// Retorna number, lanza error si no es válido
const age = parseFormNumber(formData, 'age')
```

### parseFormNumberOptional
```typescript
// Retorna number | null, no lanza error
const optionalId = parseFormNumberOptional(formData, 'parent_id')
```

### parseFormBoolean
```typescript
// Retorna boolean con default opcional
const isActive = parseFormBoolean(formData, 'is_active', true)
// checkbox marcado = true, no marcado = false
```

### Parseo Manual (cuando necesario)
```typescript
// Para dates
const fecha = new Date(formData.get('fecha') as string)

// Para arrays o JSON
const items = JSON.parse(formData.get('items') as string) as Item[]

// Para enums específicos
const level = formData.get('level') as 'bronze' | 'silver' | 'gold'
```

## Validación

### Campos Requeridos
```typescript
const missing = validateRequired(formData, ['name', 'email', 'class_id'])
if (missing.length > 0) {
  return createActionError(`Missing required fields: ${missing.join(', ')}`)
}
```

### Validación Custom
```typescript
// Después de parsear
if (amount < 0) {
  return createActionError('Amount must be positive')
}

if (!isValidEmail(email)) {
  return createActionError('Invalid email format')
}

// Validación asíncrona
const exists = await service.checkIfExists(name)
if (exists) {
  return createActionError('Name already exists')
}
```

## Retorno de Datos

### Success con Data
```typescript
const student = await service.createStudent(data)
return createActionSuccess(student, 'Student created successfully')
```

### Success sin Data
```typescript
await service.deleteStudent(id)
return createActionSuccess(null, 'Student deleted successfully')
```

### Error con Código
```typescript
return createActionError('Invalid credentials', 'AUTH_FAILED')
```

## Patrones Comunes

### Create Action
```typescript
export const createStudent = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Student>> => {
  try {
    const missing = validateRequired(formData, ['name', 'email', 'class_id'])
    if (missing.length > 0) {
      return createActionError(`Missing: ${missing.join(', ')}`)
    }

    const name = parseFormString(formData, 'name')
    const email = parseFormString(formData, 'email')
    const classId = parseFormNumber(formData, 'class_id')
    
    const student = await adminService.createStudent({ name, email, classId })
    return createActionSuccess(student, 'Student created')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to create')
  }
}, 'create student')
```

### Update Action
```typescript
export const updateStudent = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Student>> => {
  try {
    const id = parseFormNumber(formData, 'id')
    const name = parseFormString(formData, 'name')
    const email = parseFormString(formData, 'email')
    
    const student = await adminService.updateStudent(id, { name, email })
    if (!student) {
      return createActionError('Student not found')
    }
    
    return createActionSuccess(student, 'Student updated')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to update')
  }
}, 'update student')
```

### Delete Action
```typescript
export const deleteStudent = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<null>> => {
  try {
    const id = parseFormNumber(formData, 'id')
    
    // Verificar dependencias
    const hasInvestments = await adminService.studentHasInvestments(id)
    if (hasInvestments) {
      return createActionError('Cannot delete student with investments')
    }
    
    const success = await adminService.deleteStudent(id)
    if (!success) {
      return createActionError('Student not found')
    }
    
    return createActionSuccess(null, 'Student deleted')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to delete')
  }
}, 'delete student')
```

### Toggle/Status Action
```typescript
export const toggleStudentStatus = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Student>> => {
  try {
    const id = parseFormNumber(formData, 'id')
    const isActive = parseFormBoolean(formData, 'is_active')
    
    const student = await adminService.updateStudent(id, { is_active: isActive })
    if (!student) {
      return createActionError('Student not found')
    }
    
    const status = isActive ? 'activated' : 'deactivated'
    return createActionSuccess(student, `Student ${status}`)
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to update status')
  }
}, 'toggle student status')
```

## Uso en Client Components

### Con useAutoRefresh (recomendado)
```typescript
import { useAutoRefresh } from '@/presentation/hooks/useAutoRefresh'

const { refreshAfterFormAction, isPending } = useAutoRefresh({ showAlerts: true })

const handleCreate = async (formData: FormData) => {
  const result = await refreshAfterFormAction(
    createStudent,
    formData,
    'Student created successfully'
  )
  if (result.success) {
    setShowForm(false)
  }
}
```

### Manual (cuando necesites más control)
```typescript
const handleCreate = async (formData: FormData) => {
  const result = await createStudent(formData)
  
  if (result.success) {
    // Actualizar estado local
    setStudents([...students, result.data])
    // O refrescar página
    router.refresh()
    // Mostrar mensaje
    alert('Success: ' + result.message)
  } else {
    // Mostrar error
    alert('Error: ' + result.error)
  }
}
```

## Testing Server Actions

### Test Unitario
```typescript
// Mock del servicio
jest.mock('@/services/admin-service')

describe('createStudent', () => {
  it('should create student with valid data', async () => {
    const formData = new FormData()
    formData.set('name', 'Test Student')
    formData.set('email', 'test@example.com')
    formData.set('class_id', '1')
    
    const result = await createStudent(formData)
    
    expect(result.success).toBe(true)
    expect(result.data?.name).toBe('Test Student')
  })
  
  it('should return error with missing fields', async () => {
    const formData = new FormData()
    formData.set('name', 'Test')
    // email missing
    
    const result = await createStudent(formData)
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Missing')
  })
})
```

## Checklist para Server Actions

- [ ] Usa wrapper de autenticación apropiado
- [ ] Retorna Promise<ActionResult<T>>
- [ ] Valida campos requeridos con validateRequired
- [ ] Usa helpers de parseo en lugar de casting manual
- [ ] Envuelve en try-catch
- [ ] Retorna mensajes descriptivos
- [ ] No expone detalles sensibles en errores
- [ ] Verifica permisos si es necesario
- [ ] Maneja casos edge (not found, already exists)

## Anti-patrones

```typescript
// ❌ MALO: Sin wrapper de auth
export async function createStudent(formData: FormData) {
  // Sin autenticación!
}

// ❌ MALO: Sin ActionResult
export const createStudent = withAdminAuth(async (formData: FormData) => {
  return await service.createStudent(data) // Retorna entidad directamente
})

// ❌ MALO: Casting manual
const name = formData.get('name') as string // Puede ser null!
const age = parseInt(formData.get('age') as string) // Puede fallar!

// ❌ MALO: Sin validación
export const createStudent = withAdminAuth(async (formData: FormData) => {
  const name = formData.get('name') as string // Sin verificar si existe
  return await service.createStudent({ name })
})

// ❌ MALO: Exposición de errores internos
catch (error) {
  return createActionError(error.stack) // Expone detalles internos
}
```

## Ubicaciones de Referencia

| Tipo | Ubicación | Ejemplo |
|------|-----------|---------|
| Admin actions | `/src/app/admin/[entity]/actions.ts` | `/src/app/admin/students/actions.ts` |
| Student actions | `/src/actions/student-actions.ts` | Login, profile update |
| Investment actions | `/src/actions/investment-actions.ts` | Cálculos, consultas |
| Helpers | `/src/utils/server-actions.ts` | Wrappers y utilidades |
| Types | `/src/utils/admin-server-action-types.ts` | ActionResult<T> |