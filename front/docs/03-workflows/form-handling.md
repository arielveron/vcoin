# Workflow: Form Handling

## Cuándo usar este documento
Al crear o modificar formularios en VCoin. Cubre creación, edición, validación y manejo de estados.

## Principio fundamental
Formularios usan FormData nativo + server actions. NO uses controlled components a menos que sea necesario.

## Anatomía de un Formulario VCoin

### Estructura Base
```tsx
// Cliente component con formulario
export default function EntityForm({ 
  entity,
  onSuccess,
  onCancel 
}: EntityFormProps) {
  return (
    <form action={handleSubmit}>
      {/* Campos del formulario */}
      <input type="text" name="name" defaultValue={entity?.name} />
      
      {/* Botones */}
      <button type="submit">Guardar</button>
      <button type="button" onClick={onCancel}>Cancelar</button>
    </form>
  )
}
```

## Patrones de Formulario

### 1. Formulario Simple (Uncontrolled)
```tsx
// PREFERIDO: Usa FormData nativo
function StudentForm({ student, onSuccess }: Props) {
  async function handleSubmit(formData: FormData) {
    const result = await createStudent(formData)
    if (result.success) {
      onSuccess(result.data)
    } else {
      alert(result.error)
    }
  }

  return (
    <form action={handleSubmit}>
      <input 
        name="name" 
        defaultValue={student?.name}
        required 
      />
      <input 
        name="email" 
        type="email"
        defaultValue={student?.email}
        required 
      />
      <button type="submit">Guardar</button>
    </form>
  )
}
```

### 2. Formulario con Estado (cuando necesario)
```tsx
// Solo si necesitas validación en tiempo real o campos dinámicos
function InvestmentForm({ onSuccess }: Props) {
  const [amount, setAmount] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  
  // Validación en tiempo real
  const isValid = amount && parseInt(amount) > 0
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const result = await createInvestment(formData)
    // ...
  }

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      {showPreview && <Preview amount={amount} />}
      <button type="submit" disabled={!isValid}>
        Guardar
      </button>
    </form>
  )
}
```

### 3. Formulario Modal con useFormModal
```tsx
import { useFormModal } from '@/presentation/hooks'

function StudentsPage() {
  const { 
    isOpen, 
    editingItem, 
    openCreateModal, 
    openEditModal, 
    closeModal 
  } = useFormModal<Student>()

  const handleSuccess = (student: Student) => {
    // Actualizar lista
    closeModal()
  }

  return (
    <>
      <button onClick={openCreateModal}>Crear</button>
      
      {isOpen && (
        <Modal>
          <StudentForm 
            student={editingItem}
            onSuccess={handleSuccess}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </>
  )
}
```

## Manejo de Campos

### Campos de Texto
```tsx
<input 
  type="text"
  name="name"
  defaultValue={entity?.name}
  required
  maxLength={100}
  placeholder="Nombre completo"
  className="form-input"
/>
```

### Campos Numéricos
```tsx
// Para montos (se guarda en centavos)
<input 
  type="number"
  name="amount"
  defaultValue={entity?.amount / 100}
  min="0"
  step="0.01"
  required
/>

// Para enteros
<input 
  type="number"
  name="count"
  defaultValue={entity?.count}
  min="0"
  step="1"
/>
```

### Fechas
```tsx
// IMPORTANTE: Usar formato YYYY-MM-DD
<input 
  type="date"
  name="fecha"
  defaultValue={entity?.fecha ? 
    toDateInputValue(entity.fecha) : 
    getTodayInputValue()
  }
  max={getTodayInputValue()} // No futuras
  required
/>
```

### Select/Dropdown
```tsx
<select 
  name="class_id"
  defaultValue={entity?.class_id || filters.classId}
  required
>
  <option value="">Seleccionar clase</option>
  {classes.map(cls => (
    <option key={cls.id} value={cls.id}>
      {cls.name}
    </option>
  ))}
</select>
```

### Checkbox
```tsx
<input 
  type="checkbox"
  name="is_active"
  defaultChecked={entity?.is_active ?? true}
/>
<label>Activo</label>
```

### Radio Buttons
```tsx
<fieldset>
  <legend>Nivel</legend>
  {['bronze', 'silver', 'gold'].map(level => (
    <label key={level}>
      <input 
        type="radio"
        name="level"
        value={level}
        defaultChecked={entity?.level === level}
        required
      />
      {level}
    </label>
  ))}
</fieldset>
```

## Validación

### Validación HTML5
```tsx
// Preferida para casos simples
<input 
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  title="Ingrese un email válido"
/>
```

### Validación en Server Action
```tsx
export const createStudent = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<Student>> => {
  // Validación de campos requeridos
  const missing = validateRequired(formData, ['name', 'email'])
  if (missing.length > 0) {
    return createActionError(`Faltan campos: ${missing.join(', ')}`)
  }
  
  // Validación de formato
  const email = parseFormString(formData, 'email')
  if (!isValidEmail(email)) {
    return createActionError('Email inválido')
  }
  
  // Validación de negocio
  const exists = await service.emailExists(email)
  if (exists) {
    return createActionError('Email ya registrado')
  }
  
  // Crear entidad
  const student = await service.createStudent(data)
  return createActionSuccess(student)
}, 'create student')
```

### Validación Client-Side (cuando necesaria)
```tsx
function Form() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors }
    
    if (name === 'email' && !isValidEmail(value)) {
      newErrors.email = 'Email inválido'
    } else {
      delete newErrors.email
    }
    
    setErrors(newErrors)
  }
  
  return (
    <form>
      <input 
        name="email"
        onBlur={(e) => validateField('email', e.target.value)}
      />
      {errors.email && <span className="error">{errors.email}</span>}
    </form>
  )
}
```

## Estados del Formulario

### Con useAutoRefresh
```tsx
const { refreshAfterFormAction, isPending } = useAutoRefresh()

async function handleSubmit(formData: FormData) {
  const result = await refreshAfterFormAction(
    createEntity,
    formData,
    'Creado exitosamente'
  )
  if (result.success) {
    setShowForm(false)
  }
}

return (
  <form action={handleSubmit}>
    {/* campos */}
    <button type="submit" disabled={isPending}>
      {isPending ? 'Guardando...' : 'Guardar'}
    </button>
  </form>
)
```

### Loading States Manual
```tsx
function Form() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      const result = await createEntity(formData)
      if (result.success) {
        onSuccess()
      } else {
        alert(result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <form action={handleSubmit}>
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
```

## Formularios Especiales

### Batch/Múltiples Registros
```tsx
function BatchInvestmentForm() {
  const [rows, setRows] = useState([{ student_id: '', amount: '' }])
  
  const addRow = () => {
    setRows([...rows, { student_id: '', amount: '' }])
  }
  
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.set('investments', JSON.stringify(rows))
    
    const result = await createBatchInvestments(formData)
    // ...
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {rows.map((row, i) => (
        <div key={i}>
          <select 
            value={row.student_id}
            onChange={(e) => updateRow(i, 'student_id', e.target.value)}
          >
            {/* opciones */}
          </select>
          <input 
            value={row.amount}
            onChange={(e) => updateRow(i, 'amount', e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={addRow}>+ Agregar</button>
      <button type="submit">Guardar todos</button>
    </form>
  )
}
```

### File Upload
```tsx
<form action={handleUpload} encType="multipart/form-data">
  <input 
    type="file"
    name="file"
    accept=".csv,.xlsx"
    required
  />
  <button type="submit">Subir</button>
</form>

// En server action
export const uploadFile = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult> => {
  const file = formData.get('file') as File
  if (!file) {
    return createActionError('No se seleccionó archivo')
  }
  
  const buffer = await file.arrayBuffer()
  // Procesar archivo...
})
```

## Auto-fill Pattern

### Basado en Filtros
```tsx
// Form key cambia con filtros para reset
<form key={`form-${filters.classId || 'all'}`} action={handleSubmit}>
  <select 
    name="class_id"
    defaultValue={filters.classId || ''}
  >
    <option value="">Seleccionar</option>
    {classes.map(/* ... */)}
  </select>
</form>
```

### Campos Dependientes
```tsx
function Form({ classes, students }: Props) {
  const [selectedClass, setSelectedClass] = useState('')
  
  // Filtrar estudiantes por clase seleccionada
  const filteredStudents = selectedClass
    ? students.filter(s => s.class_id === parseInt(selectedClass))
    : students
  
  return (
    <form>
      <select 
        name="class_id"
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        {/* clases */}
      </select>
      
      <select name="student_id">
        <option value="">Seleccionar estudiante</option>
        {filteredStudents.map(/* ... */)}
      </select>
    </form>
  )
}
```

## Checklist para Formularios

### Estructura
- [ ] Usa FormData nativo cuando sea posible
- [ ] Server action retorna ActionResult
- [ ] Maneja success y error cases
- [ ] Incluye loading state

### Campos
- [ ] defaultValue para edición
- [ ] required donde corresponda
- [ ] type correcto (email, number, date)
- [ ] name attribute consistente

### Validación
- [ ] HTML5 validation donde sea posible
- [ ] Server-side validation siempre
- [ ] Mensajes de error claros

### UX
- [ ] Botón deshabilitado durante submit
- [ ] Feedback visual de loading
- [ ] Focus en primer campo
- [ ] Tecla Enter funciona

## Anti-patrones

```tsx
// ❌ MALO: Controlled sin necesidad
const [name, setName] = useState('')
const [email, setEmail] = useState('')
// ... muchos estados

// ✅ BUENO: Uncontrolled con FormData
<form action={handleSubmit}>
  <input name="name" defaultValue={entity?.name} />
</form>

// ❌ MALO: Formateo en cliente
<input value={new Date(date).toLocaleDateString()} />

// ✅ BUENO: Pre-formateado
<input defaultValue={entity.date_formatted} />

// ❌ MALO: Sin loading state
<button>Guardar</button>

// ✅ BUENO: Con feedback
<button disabled={isPending}>
  {isPending ? 'Guardando...' : 'Guardar'}
</button>
```

## Referencias
- Server actions: [03-workflows/server-actions.md](./server-actions.md)
- Hooks de forms: [04-utilities/hooks-catalog.md](../04-utilities/hooks-catalog.md#useformmodal)
- Validación: [04-utilities/centralized-utilities.md](../04-utilities/centralized-utilities.md#validación)