# Utilidades Centralizadas de VCoin

## Cuándo usar este documento
Antes de crear CUALQUIER función nueva de utilidad. Si necesitas formatear, validar, transformar o procesar datos.

## Principio fundamental
**NO REINVENTES LA RUEDA** - VCoin ya tiene utilidades para la mayoría de operaciones comunes.

## Mapa de Utilidades Existentes

### 📅 Fechas - `/src/shared/utils/formatting/date.ts`
```typescript
// Comparación de fechas (ignora hora)
isSameDate(date1: Date, date2: Date): boolean

// Conversión para base de datos
toDBDateValue(date: Date | string): string  // YYYY-MM-DD

// Formateo para display
formatDate(date: Date | string): string      // DD/MM/YYYY
formatDateTime(date: Date | string): string  // DD/MM/YYYY HH:mm

// Ejemplo correcto:
import { isSameDate } from '@/shared/utils/formatting/date'
if (filters.date && !isSameDate(investment.fecha, filters.date)) return false

// ❌ NUNCA hacer esto:
const investmentDate = new Date(investment.fecha).toISOString().split('T')[0]
if (investmentDate !== filters.date) return false
```

### 💰 Formateo - `/src/shared/utils/formatting/`
```typescript
// Moneda
formatCurrency(amount: number): string  // $1.234,56

// Porcentajes
formatPercentage(value: number): string // 12,34%

// Ejemplo:
import { formatCurrency, formatPercentage } from '@/shared/utils/formatting'
<td>{formatCurrency(investment.monto)}</td>
<td>{formatPercentage(rate.monthly_rate)}</td>
```

### 🔄 Transformación de Datos - `/src/utils/admin-data-types.ts`
```typescript
// Formatters con fechas pre-formateadas (previene hydration mismatches)
formatStudentsForClient(students, investmentCounts?): StudentForClient[]
formatClassesForClient(classes): ClassForClient[]
formatInvestmentsForClient(investments): InvestmentForClient[]
formatCategoriesForClient(categories): CategoryForClient[]
formatInterestRatesForClient(rates): InterestRateForClient[]

// Tipos *ForClient incluyen campos _formatted
interface StudentForClient {
  // ... campos originales ...
  created_at_formatted: string  // Pre-formateado en servidor
  investment_count: number       // Computed property
}

// Uso en server component:
const studentsForClient = formatStudentsForClient(students, investmentCounts)
```

### 🔐 Server Actions - `/src/utils/server-actions.ts`
```typescript
// Wrappers de autenticación
withAdminAuth(handler, actionName): WrappedHandler
withStudentAuth(handler, actionName): WrappedHandler
withErrorHandling(handler, context): WrappedHandler

// Validación
validateRequired(formData, fields): string[]  // Retorna campos faltantes

// Parseo de FormData
parseFormString(formData, field): string
parseFormNumber(formData, field): number
parseFormNumberOptional(formData, field): number | null
parseFormBoolean(formData, field, defaultValue?): boolean

// ActionResult helpers
createActionSuccess<T>(data?, message?): ActionResult<T>
createActionError(error, code?): ActionResult

// Ejemplo completo:
export const createStudent = withAdminAuth(async (formData: FormData): Promise<ActionResult<Student>> => {
  const missing = validateRequired(formData, ['name', 'email'])
  if (missing.length > 0) {
    return createActionError(`Missing: ${missing.join(', ')}`)
  }
  
  const name = parseFormString(formData, 'name')
  const classId = parseFormNumber(formData, 'class_id')
  const isActive = parseFormBoolean(formData, 'is_active', true)
  
  const student = await adminService.createStudent({ name, classId, isActive })
  return createActionSuccess(student, 'Student created successfully')
}, 'create student')
```

### 🎣 Hooks Reutilizables - `/src/presentation/hooks/`
```typescript
// Server actions
useServerAction(action): { executeAction, loading, error }

// Modales
useFormModal(): { isOpen, openModal, closeModal }

// Tablas con filtros
useDataTable(data, columns): { filteredData, sortedData, searchQuery }

// Media queries
useMediaQuery(query): boolean

// Estado sincronizado
useCollapsibleStore(): { isExpanded, toggle }

// Paginación
usePagination(options): { currentPage, itemsPerPage, goToPage }

// Filtros admin
useAdminFilters(): { filters, updateFilters, clearFilters }

// Sorting
useAdminSorting(options): { currentSort, updateSort }
```

### ❌ Manejo de Errores - `/src/shared/utils/errors/`
```typescript
// Procesamiento de errores
handleError(error, defaultMessage): ErrorResult
formatErrorMessage(error): string

// Logging seguro
logError(error, context): void

// Ejemplo:
try {
  return await operation()
} catch (error) {
  return handleError(error, 'Operation failed')
}
```

### 📊 Cálculos de Inversión - `/src/core/domain/investment/calculations.ts`
```typescript
// Cálculo de interés compuesto
calculateMontoActual(investments, classSettings): number
calculateCompoundInterest(principal, rate, time): number
getApplicableInterestRate(date, rates): number

// NO modifiques estas funciones sin entender el modelo de interés
```

### 🔍 Validación - `/src/shared/utils/validation/`
```typescript
// Validación de email
isValidEmail(email): boolean

// Validación de registro
isValidRegistryNumber(registro): boolean

// Validación de password
isValidPassword(password): boolean
validatePasswordStrength(password): PasswordStrength
```

## Antes de Crear una Nueva Utilidad

### Checklist
- [ ] Busqué en `/src/shared/utils/`
- [ ] Busqué en `/src/utils/`
- [ ] Busqué en `/src/presentation/hooks/`
- [ ] Verifiqué si puedo extender una utilidad existente
- [ ] La función será usada en múltiples lugares
- [ ] No existe una solución nativa de JavaScript/TypeScript

### Si DEBES crear una nueva utilidad

1. **Ubicación**:
   - Función pura (sin side effects): `/src/shared/utils/[categoria]/`
   - Hook reutilizable: `/src/presentation/hooks/`
   - Específica de admin: `/src/utils/`

2. **Naming**:
   - Verbos para funciones: `formatDate`, `validateEmail`
   - `use` prefix para hooks: `useMediaQuery`, `useDebounce`
   - Descriptivo y específico

3. **Testing**:
   - Agregar tests unitarios
   - Documentar casos edge
   - Incluir ejemplos de uso

## Ubicaciones Rápidas

| Necesito... | Buscar en... | Importar desde... |
|------------|-------------|------------------|
| Formatear fecha | `/src/shared/utils/formatting/date.ts` | `@/shared/utils/formatting/date` |
| Formatear moneda | `/src/shared/utils/formatting/currency.ts` | `@/shared/utils/formatting` |
| Transformar para cliente | `/src/utils/admin-data-types.ts` | `@/utils/admin-data-types` |
| Wrapper de auth | `/src/utils/server-actions.ts` | `@/utils/server-actions` |
| Hook de UI | `/src/presentation/hooks/` | `@/presentation/hooks` |
| Cálculos de inversión | `/src/core/domain/investment/calculations.ts` | `@/core/domain/investment/calculations` |
| Manejo de errores | `/src/shared/utils/errors/` | `@/shared/utils/errors` |

## Anti-patrones Comunes

```typescript
// ❌ MALO: Formateo manual
const formatted = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS'
}).format(amount)

// ✅ BUENO: Usar utilidad
import { formatCurrency } from '@/shared/utils/formatting'
const formatted = formatCurrency(amount)

// ❌ MALO: Comparación manual de fechas
const date1Str = date1.toISOString().split('T')[0]
const date2Str = date2.toISOString().split('T')[0]
if (date1Str === date2Str)

// ✅ BUENO: Usar utilidad
import { isSameDate } from '@/shared/utils/formatting/date'
if (isSameDate(date1, date2))

// ❌ MALO: Crear nuevo wrapper de auth
const myAuthWrapper = async (handler) => {
  const session = await auth()
  if (!session) throw new Error('Unauthorized')
  return handler()
}

// ✅ BUENO: Usar existente
import { withAdminAuth } from '@/utils/server-actions'
export const action = withAdminAuth(handler, 'action name')
```

## Regla de Oro
Si estás escribiendo más de 5 líneas de código para algo que parece genérico, PARA y busca si ya existe una utilidad para eso.