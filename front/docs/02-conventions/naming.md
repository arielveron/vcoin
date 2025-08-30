# Convenciones de Nombres - VCoin

## Cuándo usar este documento
Cuando nombres archivos, variables, funciones, componentes o cualquier elemento del código.

## Principio fundamental
Consistencia sobre preferencia personal. Sigue los patrones existentes en VCoin.

## Archivos y Carpetas

### Componentes React
```typescript
// ✅ PascalCase para componentes
StudentsPage.tsx
StudentForm.tsx
InvestmentTable.tsx

// ❌ NO uses kebab-case para componentes
students-page.tsx  // MALO
```

### Server Components vs Client Components
```typescript
// Server component (page)
/app/admin/students/page.tsx

// Client component
/app/admin/students/students-admin-client.tsx  // kebab-case con sufijo

// Componentes en presentation layer
/presentation/features/admin/students/StudentsPage.tsx  // PascalCase
```

### Server Actions
```typescript
// Siempre 'actions.ts' en singular
/app/admin/students/actions.ts

// Para acciones globales: kebab-case
/src/actions/student-actions.ts
/src/actions/investment-actions.ts
```

### Repositorios
```typescript
// kebab-case con sufijo -repo
/src/repos/student-repo.ts
/src/repos/investment-repo.ts
/src/repos/interest-rate-history-repo.ts
```

### Servicios
```typescript
// kebab-case con sufijo -service
/src/services/admin-service.ts
/src/services/student-auth-service.ts
/src/services/secure-student-session-service.ts
```

### Hooks
```typescript
// camelCase con prefijo 'use'
useServerAction.ts
useFormModal.ts
useAdminSorting.ts
```

### Utilidades
```typescript
// kebab-case para archivos de utilidad
format-dates.ts
server-actions.ts
admin-data-types.ts
```

## Variables y Constantes

### Variables Locales
```typescript
// camelCase
const studentName = 'John'
const isActive = true
const investmentCount = 5
```

### Constantes Globales
```typescript
// UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const DEFAULT_PAGE_SIZE = 10
const SESSION_TIMEOUT_MS = 3600000
```

### Configuración y Opciones
```typescript
// UPPER_SNAKE_CASE para configs
const RATE_LIMITS = {
  webhook_per_hour: 10,
  manual_per_user: 20
}

// camelCase para opciones de función
const paginationOptions = {
  defaultItemsPerPage: 10,
  preserveFilters: true
}
```

## Funciones

### Funciones Regulares
```typescript
// camelCase con verbo
function calculateInterest(principal: number, rate: number): number
function formatStudentName(student: Student): string
function validateEmail(email: string): boolean
```

### Server Actions
```typescript
// camelCase, descriptivo
export const createStudent = withAdminAuth(async () => {})
export const updateInvestment = withAdminAuth(async () => {})
export const deleteCategory = withAdminAuth(async () => {})
```

### Event Handlers
```typescript
// handle + Evento
const handleSubmit = () => {}
const handleDelete = () => {}
const handleFilterChange = () => {}
```

### Hooks Personalizados
```typescript
// use + Funcionalidad
function useServerAction() {}
function useStudentData() {}
function useAdminFilters() {}
```

## Tipos e Interfaces

### Interfaces
```typescript
// PascalCase, sin prefijo 'I'
interface Student {
  id: number
  name: string
}

// Para props de componentes
interface StudentsPageProps {
  students: Student[]
}

// Para requests
interface CreateStudentRequest {
  name: string
  email: string
}
```

### Type Aliases
```typescript
// PascalCase
type StudentForClient = Student & {
  created_at_formatted: string
}

type ActionResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }
```

### Enums
```typescript
// PascalCase para enum, PascalCase para valores
enum UserRole {
  Admin = 'ADMIN',
  Student = 'STUDENT',
  Teacher = 'TEACHER'
}

// O como const objects
const InvestmentStatus = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected'
} as const
```

## Clases

### Nombres de Clases
```typescript
// PascalCase con sufijo descriptivo
class StudentRepository {}
class AdminService {}
class ValidationError extends Error {}
class CalculationEngine {}
```

### Métodos de Clase
```typescript
class StudentRepository {
  // camelCase para métodos
  async findAll(): Promise<Student[]>
  async findById(id: number): Promise<Student>
  async create(data: CreateStudentRequest): Promise<Student>
}
```

## Base de Datos

### Tablas
```sql
-- snake_case plural
CREATE TABLE students (...)
CREATE TABLE investments (...)
CREATE TABLE interest_rate_history (...)
CREATE TABLE student_achievements (...)
```

### Columnas
```sql
-- snake_case
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP,
  is_active BOOLEAN
)
```

### Índices
```sql
-- idx_[tabla]_[columnas]
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_investments_student_id_fecha ON investments(student_id, fecha);
```

## Rutas y URLs

### Admin Routes
```
/admin/students       # plural, kebab-case
/admin/investments
/admin/interest-rates
/admin/achievements/manage  # sub-rutas con verbos cuando necesario
```

### API Routes (solo para auth)
```
/api/auth/[...nextauth]
/api/auth/student/login
/api/auth/student/logout
```

### Student Routes
```
/student              # singular para área personal
/student/profile
/student/achievements
```

## Props de Componentes

### Interfaces de Props
```typescript
// Sufijo 'Props' para props de componentes
interface StudentFormProps {
  student?: Student
  onSubmit: (data: Student) => void
  onCancel: () => void
}

// Para páginas, incluir 'Page'
interface StudentsPageProps {
  initialStudents: StudentForClient[]
  classes: ClassForClient[]
}
```

### Callbacks y Handlers
```typescript
// on + Evento para callbacks
interface FormProps {
  onSubmit: (data: FormData) => void
  onSuccess: (result: Student) => void
  onError: (error: string) => void
  onCancel: () => void
}
```

## Estados y Efectos

### useState
```typescript
// [valor, setValor] - camelCase
const [isLoading, setIsLoading] = useState(false)
const [studentData, setStudentData] = useState<Student>()
const [selectedIds, setSelectedIds] = useState<number[]>([])

// Para modales/formularios
const [showForm, setShowForm] = useState(false)
const [editingStudent, setEditingStudent] = useState<Student | null>(null)
```

### useEffect Dependencies
```typescript
// Nombres descriptivos para efectos
useEffect(() => {
  loadStudentData()
}, [studentId]) // dependency clara

useEffect(() => {
  const handleResize = () => {}
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, []) // efecto de montaje
```

## Mensajes y Textos

### Mensajes de Error
```typescript
// Constantes en UPPER_SNAKE_CASE
const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'Email inválido',
  STUDENT_NOT_FOUND: 'Estudiante no encontrado'
}
```

### Mensajes de UI
```typescript
// Para textos dinámicos, usar template literals
const successMessage = `Estudiante ${studentName} creado exitosamente`
const confirmMessage = `¿Está seguro de eliminar a ${student.name}?`
```

## Comentarios y Documentación

### Comentarios de Sección
```typescript
// ============================================================================
// SECTION NAME
// ============================================================================

// -------------------------------------------------------------------
// Subsection
// -------------------------------------------------------------------
```

### JSDoc para Funciones Públicas
```typescript
/**
 * Calcula el monto actual con interés compuesto
 * @param investments - Lista de inversiones
 * @param classSettings - Configuración de la clase
 * @returns Monto total actualizado
 */
export function calculateMontoActual(
  investments: Investment[],
  classSettings: ClassSettings
): number
```

### TODOs y FIXMEs
```typescript
// TODO: Implementar paginación del lado del servidor
// FIXME: Corregir cálculo de interés para fechas futuras
// HACK: Workaround temporal hasta migrar a nueva API
// NOTE: Este comportamiento es intencional por requisito X
```

## Patrones Específicos de VCoin

### Tipos ForClient
```typescript
// Siempre: [Entity]ForClient
StudentForClient
ClassForClient
InvestmentForClient

// Funciones de formateo: format[Entities]ForClient
formatStudentsForClient()
formatClassesForClient()
formatInvestmentsForClient()
```

### ActionResult Pattern
```typescript
// Siempre este formato exacto
export type ActionResult<T> = 
  | { success: true; data?: T; message?: string }
  | { success: false; error: string; code?: string }
```

### Wrappers de Autenticación
```typescript
// with + TipoAuth
withAdminAuth()
withStudentAuth()
withErrorHandling()
```

## Checklist de Naming

### Antes de Crear un Archivo
- [ ] Reviso archivos similares existentes
- [ ] Uso el mismo patrón de nombres
- [ ] El nombre es descriptivo y claro
- [ ] Sigo la convención de la carpeta

### Para Variables
- [ ] camelCase para variables locales
- [ ] UPPER_SNAKE_CASE para constantes
- [ ] Nombres descriptivos, no abreviaciones

### Para Funciones
- [ ] Empiezan con verbo (get, set, create, update, delete, calculate, format, validate)
- [ ] Son autodocumentadas por su nombre
- [ ] Handlers empiezan con 'handle'

### Para Tipos
- [ ] PascalCase siempre
- [ ] Sin prefijos innecesarios (no 'I' para interfaces)
- [ ] Sufijos descriptivos cuando aplica (Request, Response, Props, ForClient)

## Anti-patrones a Evitar

```typescript
// ❌ MALO: Nombres genéricos
const data = await fetch()
const obj = {}
const arr = []
const temp = calculate()

// ✅ BUENO: Nombres específicos
const students = await fetchStudents()
const studentMap = {}
const investmentList = []
const interestAmount = calculateInterest()

// ❌ MALO: Abreviaciones confusas
const stdnt = getStudent()
const invCnt = investments.length
const calcAmt = amount

// ✅ BUENO: Nombres completos
const student = getStudent()
const investmentCount = investments.length
const calculatedAmount = amount

// ❌ MALO: Mezclar idiomas
const estudiantesList = []
const montoTotal = 0

// ✅ BUENO: Consistente en inglés
const studentsList = []
const totalAmount = 0
```