# Import Paths y Alias de TypeScript

## Cuándo usar este documento
Cuando no sepas desde dónde importar algo o qué alias usar. Cuando agregues nuevos archivos y necesites decidir la ruta de importación.

## Principio fundamental
Usa SIEMPRE alias de TypeScript (@/) para imports. NUNCA uses rutas relativas (../) excepto para archivos en la misma carpeta.

## Mapa de Alias Configurados

### Alias Base
```typescript
// tsconfig.json paths
"@/*": ["./src/*"]
```

## Guía de Imports por Categoría

### 🧠 Lógica de Negocio y Dominio
```typescript
// Cálculos y lógica de inversión
import { calculateMontoActual, calculateCompoundInterest } from '@/core/domain/investment/calculations'

// Lógica de achievements
import { AchievementEngine } from '@/core/domain/achievement/engine'

// Casos de uso
import { CreateStudent } from '@/core/use-cases/admin/CreateStudent'
```

### 🗄️ Acceso a Datos
```typescript
// Repositorios
import { StudentRepository } from '@/repos/student-repo'
import { InvestmentRepository } from '@/repos/investment-repo'
import { ClassRepository } from '@/repos/class-repo'

// Servicios
import { AdminService } from '@/services/admin-service'
import { StudentAuthService } from '@/services/student-auth-service'
import { SecureStudentSessionService } from '@/services/secure-student-session-service'

// Configuración de base de datos
import { pool } from '@/config/database'
```

### 🎨 Componentes de Presentación
```typescript
// Features admin
import { StudentsPage } from '@/presentation/features/admin/students/StudentsPage'
import { StudentsTable } from '@/presentation/features/admin/students/components/StudentsTable'
import { StudentForm } from '@/presentation/features/admin/students/components/StudentForm'

// Features student
import { Dashboard } from '@/presentation/features/student/dashboard/Dashboard'
import { Profile } from '@/presentation/features/student/profile/Profile'

// Hooks reutilizables
import { useServerAction, useFormModal, usePagination } from '@/presentation/hooks'
```

### 🛠️ Utilidades Compartidas
```typescript
// Formateo
import { formatCurrency, formatDate, formatPercentage } from '@/shared/utils/formatting'
import { isSameDate, toDBDateValue } from '@/shared/utils/formatting/date'

// Validación
import { validateRequired, email, minLength } from '@/shared/utils/validation'

// Errores
import { BusinessError, ValidationError, ERROR_MESSAGES } from '@/shared/utils/errors'

// Personalización
import { getPersonalizedAchievementName } from '@/shared/utils/personalization'
```

### 📊 Utilidades Admin
```typescript
// Tipos de datos para cliente
import { 
  StudentForClient, 
  ClassForClient,
  formatStudentsForClient,
  formatClassesForClient 
} from '@/utils/admin-data-types'

// Tipos de server actions
import { ActionResult, StudentsPageProps } from '@/utils/admin-server-action-types'

// Server action utilities
import { 
  withAdminAuth, 
  withStudentAuth,
  validateRequired,
  parseFormString,
  parseFormNumber,
  createActionSuccess,
  createActionError
} from '@/utils/server-actions'

// Formateo de fechas
import { withFormattedDates } from '@/utils/format-dates'
```

### 🔐 Autenticación
```typescript
// NextAuth/Auth.js
import { auth } from '@/auth'

// Utilities de auth
import { checkAdminAuth } from '@/utils/admin-auth'
import { AuthConfigError } from '@/utils/auth-config'
import { checkDatabaseConnection, DatabaseConnectionError } from '@/utils/db-check'
```

### 📝 Tipos TypeScript
```typescript
// Tipos de base de datos
import { 
  Student, 
  Class, 
  Investment,
  Achievement,
  CreateStudentRequest 
} from '@/types/database'

// Tipos de sesión
import { SessionData } from '@/types/auth'
```

### ⚙️ Configuración
```typescript
// Traducciones
import { translations } from '@/config/translations'

// Configuración de base de datos
import { dbConfig } from '@/config/database'
```

### 🧩 Componentes Compartidos
```typescript
// Componentes admin compartidos
import { FilterBadges } from '@/app/admin/components/filter-badges'
import { AdminNav } from '@/app/admin/components/admin-nav'

// Componentes UI generales
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
```

## Patrones de Import

### ✅ CORRECTO: Imports Absolutos con Alias
```typescript
// SIEMPRE usa @ para src/
import { StudentRepository } from '@/repos/student-repo'
import { formatCurrency } from '@/shared/utils/formatting'
import { useServerAction } from '@/presentation/hooks'
```

### ❌ INCORRECTO: Imports Relativos
```typescript
// NUNCA uses rutas relativas para salir de carpetas
import { StudentRepository } from '../../../repos/student-repo'
import { formatCurrency } from '../../utils/formatting'
```

### ✅ EXCEPCIÓN: Mismo Directorio
```typescript
// OK para archivos en la misma carpeta
import { StudentForm } from './StudentForm'
import { studentValidation } from './validation'
```

### ✅ Imports Agrupados desde Index
```typescript
// Preferido cuando existe index.ts
import { 
  useServerAction, 
  useFormModal, 
  usePagination 
} from '@/presentation/hooks' // usa index.ts

// En lugar de
import { useServerAction } from '@/presentation/hooks/useServerAction'
import { useFormModal } from '@/presentation/hooks/useFormModal'
```

## Organización de Imports en Archivos

### Orden Recomendado
```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'

// 2. Bibliotecas externas
import { format } from 'date-fns'

// 3. Autenticación y configuración
import { auth } from '@/auth'
import { translations } from '@/config/translations'

// 4. Tipos
import type { Student, Class } from '@/types/database'

// 5. Servicios y repositorios
import { AdminService } from '@/services/admin-service'

// 6. Utilidades
import { formatCurrency } from '@/shared/utils/formatting'
import { withAdminAuth } from '@/utils/server-actions'

// 7. Componentes
import { StudentsTable } from '@/presentation/features/admin/students/components/StudentsTable'

// 8. Archivos locales
import { localHelper } from './helpers'
```

## Resolución de Problemas Comunes

### "Cannot find module '@/...'"
**Solución**: Verifica que el archivo existe en `src/` y que la ruta después de `@/` es correcta.

### "Module '"@/presentation/hooks"' has no exported member..."
**Solución**: Verifica que el hook está exportado desde `/src/presentation/hooks/index.ts`

### Imports circulares
**Síntoma**: "Cannot access 'X' before initialization"  
**Solución**: Reorganiza para que las dependencias fluyan en una dirección. Usa imports de tipo (`import type`) cuando sea posible.

## Migrando Imports Antiguos

### De Rutas Relativas a Alias
```typescript
// Antes
import { StudentRepo } from '../../../repositories/student'
import { formatDate } from '../../utils/date-formatter'

// Después
import { StudentRepository } from '@/repos/student-repo'
import { formatDate } from '@/shared/utils/formatting/date'
```

### De Imports Dispersos a Centralizados
```typescript
// Antes
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'
import { formatPercentage } from '@/utils/percentage'

// Después
import { formatDate, formatCurrency, formatPercentage } from '@/shared/utils/formatting'
```

## Checklist para Nuevos Archivos

- [ ] Uso alias `@/` para todos los imports de src/
- [ ] No uso rutas relativas `../` excepto mismo directorio
- [ ] Si creo utilidad, la pongo en ubicación correcta
- [ ] Si es reutilizable, lo exporto desde index.ts
- [ ] Imports ordenados por categoría
- [ ] No hay imports circulares

## Referencia Rápida

| Necesito importar... | Desde... |
|---------------------|----------|
| Tipos de DB | `@/types/database` |
| Repositorios | `@/repos/[entity]-repo` |
| Servicios | `@/services/[service]-service` |
| Hooks | `@/presentation/hooks` |
| Formateo | `@/shared/utils/formatting` |
| Validación | `@/shared/utils/validation` |
| Server actions helpers | `@/utils/server-actions` |
| Admin data types | `@/utils/admin-data-types` |
| Componentes admin | `@/presentation/features/admin/[feature]` |
| Auth | `@/auth` |