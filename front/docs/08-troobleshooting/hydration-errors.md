# Troubleshooting: Errores de Hidratación

## Cuándo usar este documento
Cuando veas errores de "Hydration mismatch", "Text content does not match", o componentes que se renderizan diferente entre servidor y cliente.

## Principio fundamental
El HTML renderizado en servidor DEBE ser idéntico al primer render en cliente. Cualquier diferencia causa error de hidratación.

## Errores Comunes y Soluciones

### Error: "Text content does not match server-rendered HTML"

#### Causa 1: Formateo de Fechas en Cliente
```typescript
// ❌ MALO: La fecha se formatea diferente en servidor vs cliente
function InvestmentRow({ investment }) {
  return (
    <td>{new Date(investment.fecha).toLocaleDateString()}</td>
  )
}
```

**Síntomas**:
- Fechas aparecen en formato diferente
- Error específicamente menciona fechas
- Funciona en desarrollo pero falla en producción

**Solución**:
```typescript
// ✅ BUENO: Formatear en servidor y pasar pre-formateado

// En page.tsx (server component)
const investmentsForClient = formatInvestmentsForClient(investments)

// En client component
function InvestmentRow({ investment }) {
  return (
    <td>{investment.fecha_formatted}</td> // Ya viene formateado
  )
}
```

#### Causa 2: Uso de Date() o Timestamps
```typescript
// ❌ MALO: El tiempo cambia entre servidor y cliente
function Header() {
  return (
    <div>Última actualización: {new Date().toLocaleTimeString()}</div>
  )
}
```

**Solución**:
```typescript
// ✅ BUENO: Pasar timestamp desde servidor
// En page.tsx
const lastUpdate = new Date().toLocaleTimeString('es-AR')
<Header lastUpdate={lastUpdate} />

// En client component
function Header({ lastUpdate }) {
  return (
    <div>Última actualización: {lastUpdate}</div>
  )
}
```

#### Causa 3: Formateo de Moneda Inconsistente
```typescript
// ❌ MALO: toLocaleString puede variar
function MontoDisplay({ amount }) {
  return (
    <span>{amount.toLocaleString('es-AR', { 
      style: 'currency', 
      currency: 'ARS' 
    })}</span>
  )
}
```

**Solución**:
```typescript
// ✅ BUENO: Usar utilidad centralizada y formatear en servidor

// En server component
const montoFormatted = formatCurrency(amount)

// En client component
function MontoDisplay({ montoFormatted }) {
  return <span>{montoFormatted}</span>
}
```

### Error: "Prop `className` did not match"

#### Causa: Clases Dinámicas Basadas en Cliente
```typescript
// ❌ MALO: window no existe en servidor
function NavBar() {
  const isMobile = window.innerWidth < 768
  return (
    <nav className={isMobile ? 'mobile-nav' : 'desktop-nav'}>
  )
}
```

**Solución**:
```typescript
// ✅ BUENO: Usar useEffect o CSS responsive
function NavBar() {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])
  
  // O mejor: usar CSS responsive
  return (
    <nav className="nav-responsive">
  )
}
```

### Error: "Warning: Expected server HTML to contain matching..."

#### Causa: Renderizado Condicional con Data del Cliente
```typescript
// ❌ MALO: localStorage no existe en servidor
function UserPreferences() {
  const theme = localStorage.getItem('theme')
  return (
    <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>
  )
}
```

**Solución**:
```typescript
// ✅ BUENO: Usar useEffect para cliente-only
function UserPreferences() {
  const [theme, setTheme] = useState('light') // Default
  
  useEffect(() => {
    setTheme(localStorage.getItem('theme') || 'light')
  }, [])
  
  return (
    <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>
  )
}
```

## Patrón VCoin para Prevenir Hidratación

### 1. Tipos ForClient con Formateo
```typescript
// utils/admin-data-types.ts
export type StudentForClient = Student & {
  created_at_formatted: string
  updated_at_formatted: string
  // Todos los campos que necesitan formato
}

export function formatStudentsForClient(students: Student[]): StudentForClient[] {
  return students.map(student => ({
    ...student,
    created_at_formatted: formatDate(student.created_at),
    updated_at_formatted: formatDate(student.updated_at)
  }))
}
```

### 2. Server Component Formatea
```typescript
// app/admin/students/page.tsx
export default async function StudentsPage() {
  const students = await adminService.getAllStudents()
  
  // CRÍTICO: Formatear en servidor
  const studentsForClient = formatStudentsForClient(students)
  
  return <StudentsClient students={studentsForClient} />
}
```

### 3. Client Component Usa Pre-formateado
```typescript
// students-admin-client.tsx
function StudentsClient({ students }: { students: StudentForClient[] }) {
  return students.map(student => (
    <tr key={student.id}>
      <td>{student.name}</td>
      <td>{student.created_at_formatted}</td> {/* Ya formateado */}
    </tr>
  ))
}
```

## Checklist de Prevención

### Antes de Commitear
- [ ] NO hay `new Date().toLocaleString()` en client components
- [ ] NO hay `toLocaleString()` para moneda en client components
- [ ] NO hay acceso a `window`, `localStorage`, `document` en render inicial
- [ ] Todos los tipos *ForClient tienen campos `_formatted`
- [ ] Server components hacen el formateo

### Durante Review
- [ ] Buscar: `toLocaleString`, `toLocaleDateString`, `toLocaleTimeString`
- [ ] Buscar: `new Date()` en componentes
- [ ] Buscar: `window.`, `localStorage.`, `document.`
- [ ] Verificar: Tipos usan `*ForClient`

## Herramientas de Debug

### 1. React DevTools
- Instalar extensión de Chrome/Firefox
- Buscar componentes con ⚠️ warning
- Comparar props entre servidor y cliente

### 2. Console Warnings
```javascript
// Buscar estos mensajes:
"Warning: Text content did not match"
"Warning: Prop `className` did not match"
"Warning: Expected server HTML to contain"
```

### 3. Agregar Debug Temporal
```typescript
// Para encontrar diferencias
useEffect(() => {
  console.log('Client render:', value)
}, [])

// En servidor
console.log('Server render:', value)
```

## Casos Especiales VCoin

### Cálculo de Interés en Tiempo Real
```typescript
// ❌ MALO: El cálculo cambia cada segundo
function MontoActual({ investment }) {
  const current = calculateMontoActual(investment, new Date())
  return <span>{current}</span>
}
```

**Solución**:
```typescript
// ✅ BUENO: Calcular en servidor con timestamp fijo
// O usar useEffect para actualización client-side only
function MontoActual({ initialAmount }) {
  const [amount, setAmount] = useState(initialAmount)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAmount(calculateMontoActual(investment, new Date()))
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  
  return <span>{amount}</span>
}
```

### Timezone Issues
```typescript
// ❌ MALO: Timezone puede diferir
new Date(dateString) // Interpreta en timezone local
```

**Solución**:
```typescript
// ✅ BUENO: Usar utilidades que manejan timezone
import { normalizeDate } from '@/shared/utils/formatting/date'
const date = normalizeDate(dateString)
```

## Reglas de Oro

1. **Si cambia con el tiempo** → useEffect
2. **Si depende del navegador** → useEffect
3. **Si necesita formato** → Hacerlo en servidor
4. **Si es dinámico** → Estado con default seguro
5. **Si usa APIs del browser** → Verificar typeof window !== 'undefined'

## Referencias

- [Next.js Hydration Docs](https://nextjs.org/docs/messages/react-hydration-error)
- VCoin patterns: `/src/utils/admin-data-types.ts`
- Formatting utils: `/src/shared/utils/formatting/`