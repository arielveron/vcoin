# Schema Management - Base de Datos VCoin

## Cuándo usar este documento
Cuando necesites modificar el esquema de base de datos, agregar tablas, índices o cambiar estructura existente.

## Principio fundamental
NUNCA uses migraciones. Modifica directamente los archivos de inicialización y ejecuta `npm run setup`.

## Archivos de Schema

### Ubicaciones Críticas
```
/src/scripts/
├── init-database.sql    # Schema SQL principal
├── setup-db.ts          # Script TypeScript de setup
└── test-db.ts           # Script de prueba de conexión
```

### Flujo de Modificación
1. Editar `/src/scripts/init-database.sql`
2. Editar `/src/scripts/setup-db.ts` si hay data inicial
3. Ejecutar `npm run setup`
4. Verificar con `npm run db:test`

## Patrón de Tablas VCoin

### Estructura Estándar
```sql
CREATE TABLE entities (
    -- Siempre ID serial
    id SERIAL PRIMARY KEY,
    
    -- Campos de negocio
    name VARCHAR(255) NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL DEFAULT 0,
    
    -- Referencias (foreign keys)
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    
    -- Campos de auditoría (siempre al final)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Índices Requeridos
```sql
-- Índice para foreign keys
CREATE INDEX idx_entities_student_id ON entities(student_id);
CREATE INDEX idx_entities_class_id ON entities(class_id);

-- Índice para búsquedas frecuentes
CREATE INDEX idx_entities_name ON entities(name);

-- Índice compuesto para queries complejas
CREATE INDEX idx_entities_class_student ON entities(class_id, student_id);
```

### Trigger para updated_at
```sql
-- SIEMPRE agregar este trigger
CREATE TRIGGER update_entities_updated_at 
BEFORE UPDATE ON entities 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Tipos de Datos Estándar

### Para Moneda
```sql
-- SIEMPRE usar INTEGER para centavos
amount INTEGER NOT NULL DEFAULT 0,  -- Guarda 1234 para $12.34
```

### Para Fechas
```sql
-- Fechas sin hora
end_date DATE NOT NULL,

-- Timestamps con zona horaria
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
effective_date TIMESTAMP WITH TIME ZONE NOT NULL
```

### Para Porcentajes/Tasas
```sql
-- Como decimal para precisión
monthly_interest_rate DECIMAL(5,4) NOT NULL,  -- 0.0250 para 2.5%
```

### Para JSON
```sql
-- JSONB para data estructurada
text_style JSONB NOT NULL DEFAULT '{}',
trigger_config JSONB,
metadata JSONB DEFAULT '{}'
```

### Para Estados/Enums
```sql
-- CHECK constraints para valores limitados
status VARCHAR(20) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive', 'pending')),

level VARCHAR(20) NOT NULL 
    CHECK (level IN ('bronze', 'silver', 'gold', 'platinum'))
```

## Modificación de Schema Existente

### Agregar Nueva Tabla
```sql
-- En init-database.sql, agregar después de tablas relacionadas

-- ============================================================================
-- NEW TABLE: entity_name
-- ============================================================================
CREATE TABLE entity_name (
    id SERIAL PRIMARY KEY,
    -- campos...
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_entity_name_field ON entity_name(field);

-- Trigger
CREATE TRIGGER update_entity_name_updated_at 
BEFORE UPDATE ON entity_name 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Agregar Columna a Tabla Existente
```sql
-- En init-database.sql, buscar la tabla y agregar
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL;

-- Agregar índice si es foreign key
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
```

### Modificar Columna
```sql
-- Cambiar tipo de dato
ALTER TABLE investments 
ALTER COLUMN amount TYPE BIGINT;

-- Agregar constraint
ALTER TABLE students 
ADD CONSTRAINT unique_email UNIQUE (email);

-- Cambiar default
ALTER TABLE classes 
ALTER COLUMN is_active SET DEFAULT true;
```

## Data Inicial y Seeds

### En setup-db.ts
```typescript
// Agregar después de crear tablas
async function insertInitialData() {
  // Categorías default
  await client.query(`
    INSERT INTO investment_categories (name, level, sort_order) 
    VALUES 
      ('Examen', 'silver', 1),
      ('Tarea', 'bronze', 2),
      ('Proyecto', 'gold', 3)
    ON CONFLICT (name) DO NOTHING
  `);
  
  // Otros datos iniciales...
}
```

### Datos de Prueba
```typescript
if (process.env.NODE_ENV === 'development') {
  // Solo en desarrollo
  await insertTestData();
}
```

## Relaciones y Foreign Keys

### Cascade Options
```sql
-- CASCADE: Eliminar hijos cuando se elimina padre
student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,

-- SET NULL: Poner null cuando se elimina referencia
class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,

-- RESTRICT: No permitir eliminar si hay referencias (default)
category_id INTEGER REFERENCES categories(id),

-- NO ACTION: Similar a RESTRICT pero verificado al final de transacción
parent_id INTEGER REFERENCES entities(id) ON DELETE NO ACTION
```

### Relaciones Many-to-Many
```sql
-- Tabla intermedia
CREATE TABLE student_groups (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (student_id, group_id)
);

-- Índices para ambas direcciones
CREATE INDEX idx_student_groups_student ON student_groups(student_id);
CREATE INDEX idx_student_groups_group ON student_groups(group_id);
```

## Checklist para Cambios de Schema

### Antes de Modificar
- [ ] Backup de base de datos si es producción
- [ ] Identificar todas las referencias al cambio
- [ ] Actualizar tipos en `/src/types/database.ts`
- [ ] Planear data migration si es necesario

### Al Modificar
- [ ] Editar `init-database.sql`
- [ ] Agregar índices necesarios
- [ ] Agregar trigger de updated_at
- [ ] Usar IF NOT EXISTS para evitar errores
- [ ] Agregar comentarios descriptivos

### Después de Modificar
- [ ] Ejecutar `npm run setup`
- [ ] Verificar con `npm run db:test`
- [ ] Actualizar repositorios afectados
- [ ] Actualizar servicios afectados
- [ ] Probar CRUD completo

## Comandos Útiles

### Setup y Testing
```bash
# Recrear base de datos completa
npm run setup

# Solo verificar conexión
npm run db:test

# Conectar con psql
psql -U postgres -d vcoin_db

# Ver estructura de tabla
\d students

# Ver todos los índices
\di

# Ver foreign keys
\d+ students
```

### Queries de Verificación
```sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver columnas de una tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'students';

-- Ver índices de una tabla
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'students';

-- Ver constraints
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conrelid = 'students'::regclass;
```

## Anti-patrones a Evitar

### ❌ NO Uses Migraciones
```javascript
// MALO: Crear archivos de migración
// migrations/001_add_column.sql
// migrations/002_change_type.sql

// BUENO: Modificar directamente init-database.sql
```

### ❌ NO Uses Strings para IDs
```sql
-- MALO
id VARCHAR(36) DEFAULT gen_random_uuid()

-- BUENO
id SERIAL PRIMARY KEY
```

### ❌ NO Olvides Índices en Foreign Keys
```sql
-- MALO: Foreign key sin índice
student_id INTEGER REFERENCES students(id)

-- BUENO: Con índice
student_id INTEGER REFERENCES students(id),
CREATE INDEX idx_table_student_id ON table(student_id);
```

### ❌ NO Uses FLOAT para Dinero
```sql
-- MALO: Precisión incorrecta
amount FLOAT

-- BUENO: INTEGER en centavos
amount INTEGER  -- 1234 = $12.34
```

## Convenciones VCoin

### Nombres de Constraints
```sql
-- Primary keys: pk_[tabla]
CONSTRAINT pk_students PRIMARY KEY (id)

-- Foreign keys: fk_[tabla]_[campo]
CONSTRAINT fk_investments_student FOREIGN KEY (student_id) REFERENCES students(id)

-- Unique: unique_[tabla]_[campo]
CONSTRAINT unique_students_email UNIQUE (email)

-- Check: check_[tabla]_[condición]
CONSTRAINT check_investments_amount CHECK (amount >= 0)
```

### Orden de Elementos en CREATE TABLE
1. id SERIAL PRIMARY KEY
2. Campos de negocio requeridos
3. Campos de negocio opcionales
4. Foreign keys
5. Campos JSON/JSONB
6. Campos de estado/flags
7. created_at, updated_at