# Workflow: Agregar Nueva Feature

## Cuándo usar este documento
Al agregar cualquier funcionalidad nueva que requiera CRUD completo o parcial.

## Principio fundamental
Sigue SIEMPRE este orden: Database → Types → Repository → Service → Server Component → Client Component → Server Actions

## Checklist Completo por Pasos

### Paso 1: Database Schema
```sql
-- En /src/scripts/init-database.sql
CREATE TABLE your_entities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    -- otros campos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices necesarios
CREATE INDEX idx_your_entities_name ON your_entities(name);

-- Trigger para updated_at
CREATE TRIGGER update_your_entities_updated_at 
BEFORE UPDATE ON your_entities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Verificación:**
```bash
npm run setup
# Sin errores de SQL
```

- [ ] Tabla creada con campos necesarios
- [ ] Índices para campos de búsqueda
- [ ] Trigger updated_at agregado
- [ ] Foreign keys configuradas
- [ ] Constraints validados

### Paso 2: TypeScript Types
```typescript
// En /src/types/database.ts

export interface YourEntity {
  id: number
  name: string
  // otros campos - NO uses any
  created_at: Date
  updated_at: Date
}

export interface CreateYourEntityRequest {
  name: string
  // campos requeridos para crear
}

// Para admin UI - en /src/utils/admin-data-types.ts
export interface YourEntityForClient extends YourEntity {
  created_at_formatted: string
  updated_at_formatted: string
  // otros campos computed
}

export function formatYourEntitiesForClient(
  entities: YourEntity[]
): YourEntityForClient[] {
  return entities.map(entity => ({
    ...entity,
    created_at_formatted: formatDate(entity.created_at),
    updated_at_formatted: formatDate(entity.updated_at)
  }))
}
```

- [ ] Interface base definida
- [ ] CreateRequest interface
- [ ] ForClient interface con campos _formatted
- [ ] Formatter function en admin-data-types

### Paso 3: Repository
```typescript
// En /src/repos/your-entity-repo.ts

import { pool } from '@/config/database'
import { YourEntity, CreateYourEntityRequest } from '@/types/database'

export class YourEntityRepository {
  async findAll(): Promise<YourEntity[]> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM your_entities ORDER BY created_at DESC'
      )
      return result.rows
    } finally {
      client.release()
    }
  }

  async findById(id: number): Promise<YourEntity | null> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'SELECT * FROM your_entities WHERE id = $1',
        [id]
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  }

  async create(data: CreateYourEntityRequest): Promise<YourEntity> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO your_entities (name) 
         VALUES ($1) 
         RETURNING *`,
        [data.name]
      )
      return result.rows[0]
    } finally {
      client.release()
    }
  }

  async update(id: number, data: Partial<CreateYourEntityRequest>): Promise<YourEntity | null> {
    const client = await pool.connect()
    try {
      const updates: string[] = []
      const values: unknown[] = []
      let paramCount = 1

      if (data.name !== undefined) {
        updates.push(`name = $${paramCount++}`)
        values.push(data.name)
      }

      if (updates.length === 0) return this.findById(id)

      values.push(id)
      const result = await client.query(
        `UPDATE your_entities 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${paramCount}
         RETURNING *`,
        values
      )
      return result.rows[0] || null
    } finally {
      client.release()
    }
  }

  async delete(id: number): Promise<boolean> {
    const client = await pool.connect()
    try {
      const result = await client.query(
        'DELETE FROM your_entities WHERE id = $1',
        [id]
      )
      return result.rowCount !== null && result.rowCount > 0
    } finally {
      client.release()
    }
  }
}
```

- [ ] findAll implementado
- [ ] findById implementado
- [ ] create con RETURNING *
- [ ] update con campos parciales
- [ ] delete con verificación
- [ ] Pool connection pattern usado

### Paso 4: Service Layer
```typescript
// En /src/services/admin-service.ts (o crear nuevo service)

import { YourEntityRepository } from '../repos/your-entity-repo'

export class AdminService {
  private yourEntityRepo: YourEntityRepository

  constructor() {
    // ... otros repos
    this.yourEntityRepo = new YourEntityRepository()
  }

  // Your entity methods
  async getAllYourEntities(): Promise<YourEntity[]> {
    return await this.yourEntityRepo.findAll()
  }

  async getYourEntityById(id: number): Promise<YourEntity | null> {
    return await this.yourEntityRepo.findById(id)
  }

  async createYourEntity(data: CreateYourEntityRequest): Promise<YourEntity> {
    // Validaciones de negocio aquí
    return await this.yourEntityRepo.create(data)
  }

  async updateYourEntity(id: number, data: Partial<CreateYourEntityRequest>): Promise<YourEntity | null> {
    return await this.yourEntityRepo.update(id, data)
  }

  async deleteYourEntity(id: number): Promise<boolean> {
    // Verificar dependencias antes de eliminar
    return await this.yourEntityRepo.delete(id)
  }
}
```

- [ ] Service methods creados
- [ ] Validaciones de negocio agregadas
- [ ] Manejo de dependencias

### Paso 5: Server Component (page.tsx)
```typescript
// En /src/app/admin/your-entities/page.tsx

import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminService } from '@/services/admin-service'
import { formatYourEntitiesForClient } from '@/utils/admin-data-types'
import YourEntitiesAdminClient from './your-entities-admin-client'

export default async function YourEntitiesAdminPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/auth/signin')
  }

  const adminService = new AdminService()
  const entities = await adminService.getAllYourEntities()
  
  // Formatear en servidor para evitar hydration mismatches
  const entitiesForClient = formatYourEntitiesForClient(entities)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Your Entities</h1>
        <p className="mt-2 text-gray-600">
          Manage your entities here
        </p>
      </div>
      
      <YourEntitiesAdminClient 
        initialEntities={entitiesForClient}
      />
    </div>
  )
}
```

- [ ] Autenticación verificada
- [ ] Datos fetched del service
- [ ] Formateo server-side aplicado
- [ ] Props pasadas al client component

### Paso 6: Client Component
```typescript
// En /src/app/admin/your-entities/your-entities-admin-client.tsx

'use client'

import { useState } from 'react'
import { YourEntityForClient } from '@/utils/admin-data-types'
import { createYourEntity, updateYourEntity, deleteYourEntity } from './actions'
import { useAutoRefresh } from '@/presentation/hooks/useAutoRefresh'

interface Props {
  initialEntities: YourEntityForClient[]
}

export default function YourEntitiesAdminClient({ 
  initialEntities 
}: Props) {
  const [entities, setEntities] = useState(initialEntities)
  const [showForm, setShowForm] = useState(false)
  const [editingEntity, setEditingEntity] = useState<YourEntityForClient | null>(null)
  
  const { refreshAfterFormAction, isPending } = useAutoRefresh({
    showAlerts: true
  })

  const handleCreate = async (formData: FormData) => {
    const result = await refreshAfterFormAction(
      createYourEntity, 
      formData, 
      'Entity created successfully'
    )
    if (result.success) {
      setShowForm(false)
    }
  }

  const handleUpdate = async (formData: FormData) => {
    if (!editingEntity) return
    
    formData.set('id', editingEntity.id.toString())
    const result = await refreshAfterFormAction(
      updateYourEntity,
      formData,
      'Entity updated successfully'
    )
    if (result.success) {
      setEditingEntity(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return
    
    const formData = new FormData()
    formData.set('id', id.toString())
    await refreshAfterFormAction(
      deleteYourEntity,
      formData,
      'Entity deleted successfully'
    )
  }

  return (
    <div className="space-y-6">
      {isPending && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Updating...
        </div>
      )}
      
      {/* Tu UI aquí */}
    </div>
  )
}
```

- [ ] Estado inicial desde props
- [ ] useAutoRefresh para refresh automático
- [ ] Handlers para CRUD
- [ ] Loading indicator
- [ ] Confirmación para delete

### Paso 7: Server Actions
```typescript
// En /src/app/admin/your-entities/actions.ts

'use server'

import { AdminService } from '@/services/admin-service'
import { withAdminAuth, validateRequired, parseFormString, parseFormNumber } from '@/utils/server-actions'
import { createActionSuccess, createActionError } from '@/utils/server-actions'
import type { ActionResult } from '@/utils/admin-server-action-types'

const adminService = new AdminService()

export const createYourEntity = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<YourEntity>> => {
  try {
    const missing = validateRequired(formData, ['name'])
    if (missing.length > 0) {
      return createActionError(`Missing required fields: ${missing.join(', ')}`)
    }

    const name = parseFormString(formData, 'name')
    
    const entity = await adminService.createYourEntity({ name })
    return createActionSuccess(entity, 'Entity created successfully')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to create entity')
  }
}, 'create your entity')

export const updateYourEntity = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<YourEntity>> => {
  try {
    const id = parseFormNumber(formData, 'id')
    const name = parseFormString(formData, 'name')
    
    const entity = await adminService.updateYourEntity(id, { name })
    if (!entity) {
      return createActionError('Entity not found')
    }
    
    return createActionSuccess(entity, 'Entity updated successfully')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to update entity')
  }
}, 'update your entity')

export const deleteYourEntity = withAdminAuth(async (
  formData: FormData
): Promise<ActionResult<null>> => {
  try {
    const id = parseFormNumber(formData, 'id')
    
    const success = await adminService.deleteYourEntity(id)
    if (!success) {
      return createActionError('Entity not found')
    }
    
    return createActionSuccess(null, 'Entity deleted successfully')
  } catch (error) {
    return createActionError(error instanceof Error ? error.message : 'Failed to delete entity')
  }
}, 'delete your entity')
```

- [ ] withAdminAuth wrapper usado
- [ ] validateRequired para campos obligatorios
- [ ] parseForm* helpers usados
- [ ] ActionResult<T> return type
- [ ] Try-catch con mensajes descriptivos

### Paso 8: Navegación
```typescript
// En /src/app/admin/components/admin-nav.tsx
// Agregar en el array de navegación:
{ name: 'Your Entities', href: '/admin/your-entities' }

// En /src/config/translations.ts si usas i18n:
yourEntities: {
  title: 'Gestión de Entidades',
  // ... más traducciones
}
```

- [ ] Link agregado a navegación
- [ ] Traducciones agregadas (si aplica)

## Verificación Final

### Build Check
```bash
npm run build
# No TypeScript errors
# No build warnings
```

### Manual Testing
- [ ] Crear entidad funciona
- [ ] Editar entidad funciona
- [ ] Eliminar entidad funciona
- [ ] Auto-refresh después de cada operación
- [ ] Loading states visibles
- [ ] Mensajes de error/éxito mostrados
- [ ] Sin errores de hidratación en consola

## Estructura de Archivos Resultante
```
src/app/admin/your-entities/
├── page.tsx                    # Server component
├── your-entities-admin-client.tsx  # Client component
└── actions.ts                  # Server actions
```

## Anti-patrones a Evitar
- ❌ NO uses API routes - usa server actions
- ❌ NO formatees fechas en client - hazlo en servidor
- ❌ NO olvides el withAdminAuth wrapper
- ❌ NO uses `any` - define types apropiados
- ❌ NO copies/pegues sin cambiar nombres
- ❌ NO te saltes el formateo server-side

## Ubicaciones de Referencia
- Ejemplo completo: `/src/app/admin/students/`
- Tipos centralizados: `/src/utils/admin-data-types.ts`
- Utilidades: `/src/utils/server-actions.ts`
- Hooks: `/src/presentation/hooks/`