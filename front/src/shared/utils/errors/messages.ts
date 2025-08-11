/**
 * Error messages constants
 * Centralized error messages for consistency
 */

export const ERROR_MESSAGES = {
  // Generic errors
  GENERIC_ERROR: 'Ha ocurrido un error inesperado',
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet',
  PERMISSION_DENIED: 'No tiene permisos para realizar esta acción',
  
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  AUTH_SESSION_EXPIRED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente',
  AUTH_ACCESS_DENIED: 'Acceso denegado',
  
  // Validation errors
  VALIDATION_REQUIRED_FIELD: 'Este campo es obligatorio',
  VALIDATION_INVALID_EMAIL: 'El formato del email no es válido',
  VALIDATION_INVALID_NUMBER: 'Debe ingresar un número válido',
  VALIDATION_MIN_LENGTH: 'Debe tener al menos {min} caracteres',
  VALIDATION_MAX_LENGTH: 'No puede tener más de {max} caracteres',
  
  // Business logic errors
  BUSINESS_DUPLICATE_ENTRY: 'Ya existe un registro con estos datos',
  BUSINESS_INVALID_DATE_RANGE: 'El rango de fechas no es válido',
  BUSINESS_INSUFFICIENT_PERMISSIONS: 'No tiene permisos suficientes para esta operación',
  
  // Investment specific errors
  INVESTMENT_INVALID_AMOUNT: 'El monto de inversión debe ser mayor a cero',
  INVESTMENT_FUTURE_DATE: 'No se pueden crear inversiones con fecha futura',
  INVESTMENT_CLASS_ENDED: 'No se pueden agregar inversiones a una clase finalizada',
  
  // Student specific errors
  STUDENT_NOT_FOUND: 'Estudiante no encontrado',
  STUDENT_DUPLICATE_DNI: 'Ya existe un estudiante con este DNI',
  STUDENT_INVALID_CLASS: 'La clase especificada no es válida',
  
  // Admin specific errors
  ADMIN_INVALID_CREDENTIALS: 'Credenciales de administrador no válidas',
  ADMIN_CLASS_HAS_STUDENTS: 'No se puede eliminar una clase que tiene estudiantes asignados',
  ADMIN_RATE_CHANGE_RESTRICTED: 'No se puede cambiar la tasa de interés en esta clase'
} as const;

export const formatErrorMessage = (template: string, replacements: Record<string, string | number>): string => {
  return Object.entries(replacements).reduce(
    (message, [key, value]) => message.replace(`{${key}}`, String(value)),
    template
  );
};
