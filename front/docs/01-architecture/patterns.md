# Patrones Arquitectónicos de VCoin

## Cuándo usar este documento
Al diseñar nuevas features o refactorizar código existente. Cuando necesites entender cómo se estructura el código.

## Principio fundamental
VCoin sigue una arquitectura en capas con separación estricta de responsabilidades: Repository → Service → Server Component → Client Component → Server Actions

## Patrón de Flujo de Datos

### Flujo Completo
```
Database → Repository → Service → Server Component → Client Component
                                          ↓
                                    Server Action
                                          ↓
                                 Service → Repository → Database
```

### Responsabilidades por Capa

#### 1. Repository Layer (`/src/repos/`)
```typescript
// SOLO acceso a datos, NADA de lógica de negocio
export class StudentRepository {
  async findAll(): Promise<Student[]> {
    const client = await pool.connect()
    try {
      const result = await client.query('SELECT * FROM students')
      return result.rows
    } finally {
      client.release()
    }
  }
}
```

**Responsabilidades:**
- Queries SQL
- Mapeo de datos DB → Types
- Manejo de conexiones
- NO validación de negocio
- NO formateo

#### 2. Service Layer (`/src/services/`)
```typescript
// Lógica de negocio y orquestación
export class AdminService {
  async createStudent(data: CreateStudentRequest): Promise<Student> {
    // Validación de negocio
    if (await this.emailExists(data.email)) {
      throw new Error('Email already exists')
    }
    
    // Orquestación de repositorios
    const student = await this.studentRepo.create(data)
    await this.auditRepo.log('student_created', student.id)
    
    return student
  }
}
```

**Responsabilidades:**
- Validación de negocio
- Orquestación entre repos
- Transacciones complejas
- NO formateo de UI
- NO manejo de FormData

#### 3. Server Components (`page.tsx`)
```typescript
// Fetching y formateo server-side
export default async function StudentsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  
  // Fetch data
  const students = await adminService.getAllStudents()
  const investmentCounts = await adminService.getInvestmentCounts()
  
  // Formateo server-side CRÍTICO
  const studentsForClient = formatStudentsForClient(students, investmentCounts)
  
  return <StudentsClient initialStudents={studentsForClient} />
}
```

**Responsabilidades:**
- Autenticación
- Fetching de datos
- Formateo para cliente
- Props iniciales
- NO estado
- NO event handlers

#### 4. Client Components (`*-client.tsx`)
```typescript
// UI interactiva y estado local
'use client'

export default function StudentsClient({ initialStudents }) {
  const [students, setStudents] = useState(initialStudents)
  const { refreshAfterFormAction } = useAutoRefresh()
  
  const handleCreate = async (formData: FormData) => {
    const result = await refreshAfterFormAction(createStudent, formData)
    if (result.success) {
      // UI update
    }
  }
  
  return <>{/* UI */}</>
}
```

**Responsabilidades:**
- Estado local
- Event handlers
- Interactividad
- Llamadas a server actions
- NO lógica de negocio
- NO formateo de fechas

#### 5. Server Actions (`actions.ts`)
```typescript
// Procesamiento de formularios
export const createStudent = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Student>> => {
  try {
    const data = parseFormData(formData)
    const student = await adminService.createStudent(data)
    return createActionSuccess(student)
  } catch (error) {
    return createActionError(error.message)
  }
}, 'create student')
```

**Responsabilidades:**
- Parseo de FormData
- Autenticación
- Llamada a services
- Retorno de ActionResult
- NO lógica de negocio directa
- NO acceso directo a DB

## Patrón de Organización de Features

### Estructura por Feature
```
/src/presentation/features/admin/students/
├── StudentsPage.tsx              # Orquestador principal
├── components/
│   ├── StudentsTable.tsx        # Componente de tabla
│   ├── StudentForm.tsx          # Formulario
│   └── StudentFilters.tsx       # Filtros
├── hooks/
│   └── useStudents.ts           # Lógica específica
└── functions/
    ├── form-handlers.ts         # Handlers de formularios
    └── student-actions.ts       # Acciones sobre estudiantes
```

### Reglas de Organización
- **Máximo 200 líneas** por archivo
- **Single Responsibility** por componente
- **Hooks** para lógica reutilizable
- **Functions** para handlers complejos

## Patrón de Server Actions

### ActionResult Pattern
```typescript
// SIEMPRE este tipo de retorno
type ActionResult<T> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string }

// SIEMPRE con wrapper de auth
export const action = withAdminAuth(async (formData): Promise<ActionResult<T>> => {
  // implementación
})
```

### Validación Pattern
```typescript
const missing = validateRequired(formData, ['field1', 'field2'])
if (missing.length > 0) {
  return createActionError(`Missing: ${missing.join(', ')}`)
}
```

## Patrón de Formateo

### Server-Side Formatting (CRÍTICO)
```typescript
// EN SERVER COMPONENT
const entitiesForClient = formatEntitiesForClient(entities)

// NUNCA EN CLIENT
// ❌ const formatted = new Date(date).toLocaleDateString()
// ✅ <td>{entity.date_formatted}</td>
```

### Tipos ForClient
```typescript
interface EntityForClient extends Entity {
  created_at_formatted: string  // Pre-formateado
  amount_formatted: string      // Pre-formateado
  computed_property: number     // Calculado en servidor
}
```

## Patrón de Hooks

### Hooks de UI (`/presentation/hooks/`)
```typescript
// Reutilizables, genéricos
export function useFormModal() {
  const [isOpen, setIsOpen] = useState(false)
  return { isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }
}
```

### Hooks de Feature (`/features/*/hooks/`)
```typescript
// Específicos del dominio
export function useStudentFilters() {
  // Lógica específica de filtrado de estudiantes
}
```

## Patrón de Utilidades

### Búsqueda de Utilidades
```
1. Buscar en /src/shared/utils/     # Funciones puras
2. Buscar en /src/utils/            # Admin utilities
3. Buscar en /presentation/hooks/   # UI hooks
4. Si no existe → Crear siguiendo el patrón
```

### NO Reinventar
```typescript
// ❌ MALO
const formatted = value.toFixed(2) + '%'

// ✅ BUENO
import { formatPercentage } from '@/shared/utils/formatting'
const formatted = formatPercentage(value)
```

## Patrón de Base de Datos

### Schema Management
```sql
-- SIEMPRE en /src/scripts/init-database.sql
-- NUNCA migraciones separadas
CREATE TABLE entities (
  id SERIAL PRIMARY KEY,
  -- campos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SIEMPRE trigger para updated_at
CREATE TRIGGER update_entities_updated_at 
BEFORE UPDATE ON entities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Connection Pattern
```typescript
const client = await pool.connect()
try {
  // operaciones
} finally {
  client.release() // SIEMPRE liberar
}
```

## Patrón de Autenticación

### Dual System
```typescript
// Admin: NextAuth con Google
withAdminAuth(handler, 'action name')

// Student: Session encriptada
withStudentAuth(handler, 'action name')

// Público (raro)
withErrorHandling(handler, 'action name')
```

## Anti-Patrones Comunes

### ❌ Lógica de Negocio en Components
```typescript
// MALO
function StudentForm() {
  const calculateDiscount = (amount) => {
    if (amount > 1000) return amount * 0.9
    return amount
  }
}

// BUENO - En service o domain
```

### ❌ Formateo en Cliente
```typescript
// MALO
function StudentTable({ students }) {
  return students.map(s => (
    <td>{new Date(s.created_at).toLocaleDateString()}</td>
  ))
}

// BUENO
<td>{student.created_at_formatted}</td>
```

### ❌ Acceso Directo a DB desde Actions
```typescript
// MALO
export const getStudent = async (id) => {
  const result = await pool.query('SELECT * FROM students WHERE id = $1', [id])
  return result.rows[0]
}

// BUENO - Usar service → repository
```

### ❌ Estado Compartido Global
```typescript
// MALO
export let globalStudents = []

// BUENO - Props, context o store local
```

## Checklist de Arquitectura

- [ ] Repository solo accede a datos
- [ ] Service contiene lógica de negocio
- [ ] Server component formatea datos
- [ ] Client component maneja interactividad
- [ ] Server actions retornan ActionResult
- [ ] Formateo siempre server-side
- [ ] No hay lógica duplicada
- [ ] Se usan utilidades existentes
- [ ] Archivos < 200 líneas
- [ ] Single responsibility respetado