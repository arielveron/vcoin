# Catálogo de Hooks Reutilizables

## Cuándo usar este documento
Cuando necesites lógica de UI reutilizable o manejo de estado. Antes de crear un nuevo hook, verifica si ya existe uno aquí.

## Principio fundamental
Los hooks encapsulan lógica de UI compleja y la hacen reutilizable. Usa los existentes antes de crear nuevos.

## Hooks Disponibles

### 📝 useServerAction
**Ubicación**: `/src/presentation/hooks/useServerAction.ts`  
**Propósito**: Manejo de server actions con loading y error states

```typescript
const { execute, loading, error, clearError } = useServerAction(
  serverActionFunction,
  {
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.log('Error:', error)
  }
)

// Uso
const handleSubmit = async (formData: FormData) => {
  const result = await execute(formData)
  if (result.success) {
    // Handle success
  }
}
```

**Retorna**:
- `execute`: Función para ejecutar la action
- `loading`: Boolean indicando estado de carga
- `error`: String con mensaje de error o null
- `clearError`: Función para limpiar errores

### 🔄 useAutoRefresh
**Ubicación**: `/src/presentation/hooks/useAutoRefresh.ts`  
**Propósito**: Auto-refresh de páginas después de operaciones exitosas

```typescript
const { refreshAfterFormAction, isPending } = useAutoRefresh({
  showAlerts: true,
  successMessage: 'Operation completed'
})

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

**Retorna**:
- `refreshAfterFormAction`: Ejecuta action y refresca en éxito
- `refreshAfterAction`: Version genérica sin FormData
- `manualRefresh`: Trigger manual de refresh
- `isPending`: Estado de transición

### 🎭 useFormModal
**Ubicación**: `/src/presentation/hooks/useFormModal.ts`  
**Propósito**: Gestión de modales para formularios

```typescript
const {
  isOpen,
  isSubmitting,
  editingItem,
  isEditing,
  openCreateModal,
  openEditModal,
  closeModal,
  handleFormSubmit
} = useFormModal<Student>({
  onSuccess: () => console.log('Form submitted'),
  onError: (error) => alert(error)
})

// Abrir modal de creación
openCreateModal()

// Abrir modal de edición
openEditModal(student)

// Submit con manejo automático
await handleFormSubmit(async () => {
  await createStudent(formData)
})
```

### 📊 useDataTable
**Ubicación**: `/src/presentation/hooks/useDataTable.ts`  
**Propósito**: Lógica completa para tablas con filtros y paginación client-side

```typescript
const {
  data: paginatedData,
  columns,
  totalItems,
  totalPages,
  currentPage,
  sortColumn,
  sortDirection,
  handleSort,
  goToPage,
  goToNextPage,
  goToPrevPage,
  canGoNext,
  canGoPrev
} = useDataTable({
  data: students,
  columns: tableColumns,
  filterFn: (student) => student.active,
  itemsPerPage: 10
})
```

### 📄 usePagination
**Ubicación**: `/src/presentation/hooks/usePagination.ts`  
**Propósito**: Paginación basada en URL para persistencia

```typescript
const {
  currentPage,
  itemsPerPage,
  goToPage,
  changeItemsPerPage,
  resetPagination,
  isPending
} = usePagination({
  defaultItemsPerPage: 10,
  pageParam: 'page',
  pageSizeParam: 'size',
  autoRefresh: false
})

// Cambiar página
goToPage(3)

// Cambiar items por página (resetea a página 1)
changeItemsPerPage(25)
```

**URL Parameters**:
- `?page=2` - Página actual
- `?size=25` - Items por página

### 📱 useMediaQuery
**Ubicación**: `/src/presentation/hooks/useMediaQuery.ts`  
**Propósito**: Detección de breakpoints responsive

```typescript
const isMobile = useMediaQuery('(max-width: 640px)')
const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)')
const isDesktop = useMediaQuery('(min-width: 1025px)')

return (
  <div>
    {isMobile && <MobileView />}
    {isTablet && <TabletView />}
    {isDesktop && <DesktopView />}
  </div>
)
```

### 🔽 useCollapsibleStore
**Ubicación**: `/src/presentation/hooks/useCollapsibleStore.tsx`  
**Propósito**: Estado sincronizado para elementos colapsables

```typescript
// En el provider padre
import { CollapsibleProvider } from '@/presentation/hooks/collapsible'

<CollapsibleProvider>
  <YourComponents />
</CollapsibleProvider>

// En componentes hijos
const { isExpanded, setExpanded, toggle } = useCollapsibleStore()

<button onClick={toggle}>
  {isExpanded ? 'Collapse' : 'Expand'}
</button>
```

### 🔀 useAdminSorting
**Ubicación**: `/src/presentation/hooks/useAdminSorting.ts`  
**Propósito**: Sorting de tablas con persistencia en URL

```typescript
const {
  currentSort,
  updateSort,
  clearSort,
  getSortDirection,
  isSorted,
  getUrlWithSort
} = useAdminSorting({
  defaultSort: { field: 'name', direction: 'asc' },
  preserveFilters: true
})

// Actualizar sort
updateSort('email', 'desc')

// Check si columna está sorted
const emailSortDirection = getSortDirection('email') // 'asc' | 'desc' | null

// Aplicar sort a datos (client-side)
const sortedData = sortData(data, currentSort, customFieldAccessor)
```

**Funciones Helper**:
```typescript
// Sorting client-side
sortData<T>(data: T[], sortConfig: SortConfig, fieldAccessor?: Function): T[]

// Custom field accessor para campos complejos
const accessor = createFieldAccessor<Student>({
  full_name: (s) => `${s.first_name} ${s.last_name}`,
  class_name: (s) => classes.find(c => c.id === s.class_id)?.name
})
```

### 📦 useStudentSelectionStore
**Ubicación**: `/src/presentation/hooks/useStudentSelectionStore.ts`  
**Propósito**: Selección persistente de estudiantes (localStorage)

```typescript
const {
  selectedStudentIds,
  addStudent,
  removeStudent,
  toggleStudent,
  selectAll,
  clearAll,
  isSelected,
  getSelectedCount,
  getSelectedIds
} = useStudentSelectionStore()

// Toggle selección
toggleStudent(studentId)

// Seleccionar todos
selectAll(studentIds)

// Check si está seleccionado
if (isSelected(studentId)) {
  // ...
}

// Obtener conteo
const count = getSelectedCount()
```

**Persistencia**: Automática en localStorage con key `vcoin-student-selections`

### 🔄 useDataTableWithPagination
**Ubicación**: `/src/presentation/hooks/useDataTableWithPagination.ts`  
**Propósito**: Combina useDataTable + usePagination para solución completa

```typescript
const {
  data: paginatedData,
  allData: sortedData,
  columns,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  goToPage,
  changeItemsPerPage,
  resetPagination,
  goToNextPage,
  goToPrevPage,
  canGoNext,
  canGoPrev,
  startIndex,
  endIndex,
  isEmpty,
  isFiltered
} = useDataTableWithPagination({
  data: students,
  columns: tableColumns,
  filterFn: (student) => student.active,
  defaultItemsPerPage: 10,
  sortColumn: 'name',
  sortDirection: 'asc'
})
```

## Patrones de Uso Comunes

### Formulario con Modal y Auto-refresh
```typescript
const { isOpen, openCreateModal, closeModal } = useFormModal()
const { refreshAfterFormAction, isPending } = useAutoRefresh()

const handleCreate = async (formData: FormData) => {
  const result = await refreshAfterFormAction(createEntity, formData)
  if (result.success) {
    closeModal()
  }
}
```

### Tabla con Paginación y Sorting
```typescript
const { currentSort, updateSort } = useAdminSorting()
const { currentPage, goToPage } = usePagination()

const sortedData = sortData(data, currentSort)
const paginatedData = sortedData.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
)
```

### Responsive con Media Queries
```typescript
const isMobile = useMediaQuery('(max-width: 768px)')

return isMobile ? (
  <MobileTable data={data} />
) : (
  <DesktopTable data={data} />
)
```

## Hooks Vacíos (Por Implementar)

Estos archivos existen pero están vacíos, listos para implementación futura:

- `useAdminDataManager.ts` - Gestión unificada de datos admin
- `useAdminFiltersEnhanced.ts` - Sistema de filtros mejorado
- `useOptimisticUpdates.ts` - Updates optimistas
- `useStudentSelectionBatchInvestment.ts` - Inversiones batch para estudiantes seleccionados

## Checklist para Usar Hooks

- [ ] Busqué en este catálogo antes de crear uno nuevo
- [ ] El hook que necesito no existe o no cubre mi caso
- [ ] Si creo uno nuevo, seguiré las convenciones (use* prefix)
- [ ] Documentaré el nuevo hook en este catálogo
- [ ] Exportaré desde `/src/presentation/hooks/index.ts`

## Ubicación de Hooks por Dominio

| Necesito... | Hook | Import desde |
|------------|------|--------------|
| Server action handling | useServerAction | `@/presentation/hooks` |
| Auto-refresh después de operación | useAutoRefresh | `@/presentation/hooks` |
| Modal para formularios | useFormModal | `@/presentation/hooks` |
| Tabla con funcionalidad completa | useDataTable | `@/presentation/hooks` |
| Paginación URL-based | usePagination | `@/presentation/hooks` |
| Detección de breakpoints | useMediaQuery | `@/presentation/hooks` |
| Elementos colapsables | useCollapsibleStore | `@/presentation/hooks` |
| Sorting de tablas | useAdminSorting | `@/presentation/hooks` |
| Selección de estudiantes | useStudentSelectionStore | `@/presentation/hooks` |

## Anti-patrones

```typescript
// ❌ MALO: Crear hook duplicado
function useMyServerAction() {
  // Lógica similar a useServerAction
}

// ✅ BUENO: Usar existente
import { useServerAction } from '@/presentation/hooks'

// ❌ MALO: Estado local para paginación
const [currentPage, setCurrentPage] = useState(1)

// ✅ BUENO: URL-based con hook
const { currentPage, goToPage } = usePagination()

// ❌ MALO: Media query manual
const [isMobile, setIsMobile] = useState(false)
useEffect(() => {
  // Manual listener setup
}, [])

// ✅ BUENO: Hook existente
const isMobile = useMediaQuery('(max-width: 768px)')
```