// Spanish (Argentina) translations for VCoin Admin Panel

export const translations = {
  // Navigation
  nav: {
    dashboard: 'Panel de Control',
    classes: 'Clases',
    students: 'Estudiantes', 
    investments: 'Inversiones',
    interestRates: 'Tasas de Interés',
    signOut: 'Cerrar Sesión'
  },

  // Dashboard
  dashboard: {
    title: 'Panel de Control de Administración',
    welcome: 'Bienvenido de vuelta, {name}. Esto es lo que está pasando con VCoin.',
    totalClasses: 'Total de Clases',
    totalStudents: 'Total de Estudiantes',
    totalInvestments: 'Total de Inversiones',
    totalAmount: 'Monto Total',
    quickActions: 'Acciones Rápidas',
    manageClasses: 'Gestionar Clases',
    manageClassesDesc: 'Crear, editar y gestionar configuraciones de clases',
    manageStudents: 'Gestionar Estudiantes',
    manageStudentsDesc: 'Agregar, editar y gestionar registros de estudiantes',
    manageInvestments: 'Gestionar Inversiones',
    manageInvestmentsDesc: 'Rastrear y gestionar registros de inversiones',
    manageInterestRates: 'Tasas de Interés',
    manageInterestRatesDesc: 'Establecer y gestionar el historial de tasas de interés'
  },

  // Filters
  filters: {
    activeFilters: 'Filtros activos:',
    class: 'Clase:',
    student: 'Estudiante:',
    allClasses: 'Todas las Clases',
    selectClass: 'Seleccionar Clase',
    selectStudent: 'Seleccionar Estudiante',
    filterByClass: 'Filtrar por Clase',
    filterByStudent: 'Filtrar por Estudiante'
  },

  // Classes
  classes: {
    title: 'Gestión de Clases',
    createNew: 'Crear Nueva Clase',
    className: 'Nombre de la Clase',
    description: 'Descripción',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    noClasses: 'No se encontraron clases. Crea tu primera clase arriba.',
    enterClassName: 'Ingresa el nombre de la clase',
    enterDescription: 'Ingresa una descripción (opcional)',
    create: 'Crear'
  },

  // Students  
  students: {
    title: 'Gestión de Estudiantes',
    createNew: 'Crear Nuevo Estudiante',
    studentName: 'Nombre del Estudiante',
    email: 'Correo Electrónico',
    class: 'Clase',
    registered: 'Registrado',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    noStudents: 'No se encontraron estudiantes. Crea tu primer estudiante arriba.',
    enterStudentName: 'Ingresa el nombre del estudiante',
    enterEmail: 'Ingresa el correo electrónico',
    selectClass: 'Seleccionar clase',
    create: 'Crear',
    studentsInClass: 'estudiantes en esta clase',
    yes: 'Sí',
    no: 'No'
  },

  // Investments
  investments: {
    title: 'Gestión de Inversiones',
    createNew: 'Crear Nueva Inversión',
    student: 'Estudiante',
    amount: 'Monto',
    date: 'Fecha',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    noInvestments: 'No se encontraron inversiones. Crea tu primera inversión arriba.',
    selectStudent: 'Seleccionar estudiante',
    enterAmount: 'Ingresa el monto',
    selectDate: 'Seleccionar fecha',
    create: 'Crear'
  },

  // Interest Rates
  interestRates: {
    title: 'Gestión de Tasas de Interés',
    createNew: 'Crear Nueva Tasa',
    rate: 'Tasa',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    actions: 'Acciones',
    edit: 'Editar',
    delete: 'Eliminar',
    save: 'Guardar',
    cancel: 'Cancelar',
    noRates: 'No se encontraron tasas de interés. Crea tu primera tasa arriba.',
    enterRate: 'Ingresa la tasa (ej: 0.05 para 5%)',
    selectStartDate: 'Seleccionar fecha de inicio',
    selectEndDate: 'Seleccionar fecha de fin (opcional)',
    create: 'Crear',
    current: 'Actual'
  },

  // Common
  common: {
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    confirm: 'Confirmar',
    close: 'Cerrar',
    required: 'Requerido'
  }
}

// Helper function to replace placeholders in translation strings
export function t(key: string, replacements?: Record<string, string>): string {
  const keys = key.split('.')
  let value = translations as any
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  if (typeof value !== 'string') {
    return key // Return key if translation not found
  }
  
  if (replacements) {
    return value.replace(/\{(\w+)\}/g, (match, placeholder) => {
      return replacements[placeholder] || match
    })
  }
  
  return value
}

export default translations
