# VCoin Documentation

## Para Empezar

### Primer día con VCoin?
1. Lee [quick-reference.md](./quick-reference.md) - Índice temático
2. Revisa [01-architecture/patterns.md](../01-architecture/patterns.md) - Patrones core
3. Consulta [04-utilities/centralized-utilities.md](../04-utilities/centralized-utilities.md) - No reinventes la rueda

### Tareas Comunes

| Necesito... | Documento |
|------------|-----------|
| Agregar nueva feature completa | [03-workflows/new-feature.md](../03-workflows/new-feature.md) |
| Crear server action | [03-workflows/server-actions.md](../03-workflows/server-actions.md) |
| Encontrar utilidad existente | [04-utilities/centralized-utilities.md](../04-utilities/centralized-utilities.md) |
| Usar hooks | [04-utilities/hooks-catalog.md](../04-utilities/hooks-catalog.md) |
| Resolver imports | [02-conventions/import-paths.md](../02-conventions/import-paths.md) |
| Solucionar error de hidratación | [08-troubleshooting/hydration-errors.md](../08-troubleshooting/hydration-errors.md) |

## Estructura de Documentación

### 01-architecture/ - Arquitectura
- `patterns.md` ⭐ - Patrones arquitectónicos establecidos
- `overview.md` - Vista general del sistema
- `layer-responsibilities.md` - Responsabilidades por capa
- `meta-principle.md` - META-PRINCIPLE y su aplicación

### 02-conventions/ - Convenciones
- `import-paths.md` ⭐ - Alias y rutas de importación
- `naming.md` - Convenciones de nombres
- `file-organization.md` - Organización de archivos
- `code-style.md` - Estilo de código

### 03-workflows/ - Flujos de Trabajo
- `new-feature.md` ⭐ - Agregar feature completa paso a paso
- `server-actions.md` ⭐ - Crear server actions correctamente
- `crud-entity.md` - Patrón CRUD estándar
- `form-handling.md` - Manejo de formularios
- `authentication.md` - Flujos de autenticación

### 04-utilities/ - Utilidades
- `centralized-utilities.md` ⭐ - Mapa completo de utilidades existentes
- `hooks-catalog.md` ⭐ - Catálogo de hooks disponibles
- `date-handling.md` - Manejo de fechas
- `formatting.md` - Formateo de datos
- `validation.md` - Validación

### 05-database/ - Base de Datos
- `schema-management.md` - Gestión del esquema
- `repository-pattern.md` - Patrón repository
- `migrations.md` - NO usar migraciones
- `connection-handling.md` - Manejo de conexiones

### 06-components/ - Componentes
- `admin-components.md` - Componentes admin
- `student-components.md` - Componentes estudiante
- `shared-components.md` - Componentes compartidos
- `component-patterns.md` - Patrones de componentes

### 07-testing/ - Testing
- `testing-strategy.md` - Estrategia de testing
- `test-patterns.md` - Patrones de tests

### 08-troubleshooting/ - Solución de Problemas
- `hydration-errors.md` ⭐ - Errores de hidratación
- `common-issues.md` - Problemas comunes
- `typescript-errors.md` - Errores de TypeScript
- `debugging-tips.md` - Tips de debugging

⭐ = Documentos esenciales para empezar

## Principios Fundamentales

### 1. NO Reinventes la Rueda
VCoin tiene 50+ utilidades y 11 hooks. Antes de crear algo nuevo:
- Busca en [centralized-utilities.md](../04-utilities/centralized-utilities.md)
- Revisa [hooks-catalog.md](../04-utilities/hooks-catalog.md)
- Si no existe, créalo siguiendo los patrones

### 2. Server-Side First
- Formateo de fechas/moneda: SIEMPRE en servidor
- Usa `*ForClient` types con campos `_formatted`
- Previene errores de hidratación

### 3. Capas Estrictas
```
Repository → Service → Server Component → Client Component → Server Actions
```
Cada capa tiene responsabilidades específicas. No las mezcles.

### 4. ActionResult Everywhere
TODOS los server actions retornan `ActionResult<T>`:
```typescript
{ success: true, data?: T, message?: string } |
{ success: false, error: string, code?: string }
```

### 5. TypeScript Strict
- NO `any` types
- NO unused variables
- Tipos explícitos siempre

## Checklist Rápido

Antes de escribir código:
- [ ] Busqué si ya existe una utilidad
- [ ] Revisé hooks existentes
- [ ] Uso alias `@/` para imports
- [ ] Formateo fechas en servidor
- [ ] Server actions retornan ActionResult
- [ ] Sigo el patrón de capas

## Comandos Útiles

```bash
# Setup inicial
npm run setup          # DB + auth completo
npm run setup:env      # Genera secrets

# Desarrollo
npm run dev           # Servidor desarrollo
npm run build         # Verificar build
npm run db:test       # Test conexión DB

# Testing
npm run test          # Tests unitarios
npm run test:e2e      # Tests E2E
```

## Anti-Patrones Comunes

### ❌ NO Hagas Esto:
```typescript
// Formateo en cliente
new Date(date).toLocaleDateString()

// Import relativo
import { util } from '../../../utils'

// Server action sin ActionResult
export async function action() { return data }

// Any types
const data: any = await fetch()
```

### ✅ Haz Esto:
```typescript
// Formateo en servidor
formatDate(date) // pre-formateado

// Import con alias
import { util } from '@/utils'

// Server action con ActionResult
export const action = withAdminAuth(async () => {
  return createActionSuccess(data)
})

// Tipos explícitos
const data: Student[] = await fetch()
```

## Recursos Adicionales

- **Logs de trabajo**: `work-logs/` - Historial de cambios
- **Notas de implementación**: `implementation-notes/` - Decisiones técnicas
- **Checkpoint**: [conversation-checkpoint.md](./conversation-checkpoint.md) - Estado actual

## Contribuir

Al agregar nueva funcionalidad:
1. Sigue los workflows documentados
2. Actualiza documentación relevante
3. No dupliques utilidades existentes
4. Mantén los patrones establecidos

---

**Última actualización**: Ver [conversation-checkpoint.md](./conversation-checkpoint.md)