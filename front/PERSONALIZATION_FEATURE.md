# Personalización de Nombres en VCoin

## Descripción

Esta característica permite a los estudiantes personalizar cómo aparecen ciertos nombres en la aplicación, proporcionando una experiencia más inclusiva sin exponer explícitamente la identificación de género.

## Características

### Opciones de Personalización

- **No definido** (por defecto): Usa los nombres por defecto de los logros
- **Personalización A**: Usa variantes femeninas cuando estén disponibles
- **Personalización O**: Usa variantes masculinas cuando estén disponibles

### Campos de Base de Datos

#### Tabla `students`
```sql
ALTER TABLE students 
ADD COLUMN personalizacion VARCHAR(1) DEFAULT NULL 
CHECK (personalizacion IN ('A', 'O'));
```

#### Tabla `achievements`
```sql
ALTER TABLE achievements 
ADD COLUMN name_a VARCHAR(100) NULL,
ADD COLUMN name_o VARCHAR(100) NULL;
```

## Uso

### En el Perfil del Estudiante

Los estudiantes pueden configurar su preferencia de personalización en su página de perfil:

1. Ir a la página de perfil
2. Seleccionar la preferencia de personalización deseada
3. Ingresar la contraseña actual para confirmar los cambios
4. Guardar los cambios

### En el Código

```typescript
import { 
  getPersonalizedAchievementName,
  createPersonalizedAchievements 
} from '@/shared/utils/personalization';

// Obtener el nombre personalizado de un logro
const personalizedName = getPersonalizedAchievementName(
  achievement, 
  student.personalizacion
);

// Crear una lista de logros personalizados
const personalizedAchievements = createPersonalizedAchievements(
  achievements, 
  student.personalizacion
);
```

### En los Servicios

```typescript
// Obtener logros personalizados directamente del servicio
const achievements = await ServerDataService.getPersonalizedStudentAchievements(
  studentId, 
  personalizacion
);

const unseenAchievements = await ServerDataService.getPersonalizedUnseenAchievements(
  studentId, 
  personalizacion
);
```

## Ejemplos de Personalización

| Nombre Por Defecto | Personalización A | Personalización O |
|-------------------|-------------------|-------------------|
| Investor          | Inversora         | Inversor          |
| Scholar           | Académica         | Académico         |
| Dedicated         | Dedicada          | Dedicado          |
| Saver             | Ahorradora        | Ahorrador         |
| Wealthy           | Adinerada         | Adinerado         |

## Migración

Para aplicar la personalización a una base de datos existente, ejecutar el script de migración:

```bash
psql -d your_database -f migration-personalization.sql
```

## Testing

Para probar la funcionalidad de personalización:

```bash
npm run ts-node test-personalization.ts
```

## Arquitectura

### Utilidades de Personalización (`src/shared/utils/personalization.ts`)

- `getPersonalizedAchievementName()`: Obtiene el nombre personalizado de un logro
- `getPersonalizedText()`: Utilidad genérica para personalizar cualquier texto
- `createPersonalizedAchievement()`: Crea un objeto de logro con nombre personalizado
- `createPersonalizedAchievements()`: Crea una lista de logros personalizados

### Servicios

- `ServerDataService.getPersonalizedStudentAchievements()`: Obtiene logros personalizados
- `ServerDataService.getPersonalizedUnseenAchievements()`: Obtiene logros no vistos personalizados

### Componentes Actualizados

- `StudentProfileForm`: Formulario para configurar la personalización
- `DashboardAchievementCelebrations`: Muestra celebraciones de logros personalizados
- `AchievementSection`: Muestra listas de logros personalizados

## Consideraciones de Diseño

1. **Inclusividad**: La característica no usa terminología de género explícita, sino opciones abstractas (A/O)
2. **Opcional**: Los estudiantes pueden elegir no personalizar (opción "No definido")
3. **Fallback**: Si no hay variante personalizada, se usa el nombre por defecto
4. **Extensibilidad**: El sistema puede expandirse para personalizar otros elementos en el futuro

## Notas de Implementación

- La personalización se aplica a nivel de servicio, no a nivel de componente
- Los logros se personalizan antes de ser enviados a los componentes cliente
- La autenticación es requerida para cambiar las preferencias de personalización
- Los cambios se reflejan inmediatamente después de guardar el perfil
