// Define types for class-specific settings
export interface ClassSettings {
  end_date: Date;
  timezone: string;
  current_monthly_interest_rate?: number; // Current rate from history
}

export interface Class {
  id: number;
  name: string;
  description: string;
  end_date: Date; // Use Date type consistently
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: number;
  registro: number; // Student registry number for reference
  name: string;
  email: string;
  class_id: number;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: number;
  student_id: number;
  fecha: Date; // Use Date type consistently
  monto: number;
  concepto: string;
  created_at: string;
  updated_at: string;
}

export interface InterestRateHistory {
  id: number;
  class_id: number;
  monthly_interest_rate: number;
  effective_date: Date;
  created_at: string;
  updated_at: string;
}

export interface InterestRateChange extends InterestRateHistory {
  class_name: string;
  previous_rate?: number;
  rate_direction: 'initial' | 'up' | 'down' | 'same';
}

// Fallback data with class settings
export const classes: Class[] = [
  {
    id: 1,
    name: "Programación 2024",
    description: "Clase de programación del año 2024 - 3 estudiantes",
    end_date: new Date("2025-07-18"),
    timezone: "America/Argentina/Buenos_Aires",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 2,
    name: "Finanzas Básicas",
    description: "Curso introductorio de finanzas - 2 estudiantes",
    end_date: new Date("2025-08-15"),
    timezone: "America/Sao_Paulo",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 3,
    name: "Matemáticas Avanzadas",
    description: "Curso avanzado de matemáticas - 1 estudiante",
    end_date: new Date("2025-09-30"),
    timezone: "America/Argentina/Buenos_Aires",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

export const students: Student[] = [
  // Class 1 (Programación 2024) - 3 students
  {
    id: 1,
    registro: 1001,
    name: "María García",
    email: "maria.garcia@ejemplo.com",
    class_id: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 2,
    registro: 1002,
    name: "Carlos López",
    email: "carlos.lopez@ejemplo.com",
    class_id: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 3,
    registro: 1003,
    name: "Ana Rodríguez",
    email: "ana.rodriguez@ejemplo.com",
    class_id: 1,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  // Class 2 (Finanzas Básicas) - 2 students
  {
    id: 4,
    registro: 2001,
    name: "Pedro Silva",
    email: "pedro.silva@ejemplo.com",
    class_id: 2,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: 5,
    registro: 2002,
    name: "Laura Martínez",
    email: "laura.martinez@ejemplo.com",
    class_id: 2,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  // Class 3 (Matemáticas Avanzadas) - 1 student
  {
    id: 6,
    registro: 3001,
    name: "Diego Fernández",
    email: "diego.fernandez@ejemplo.com",
    class_id: 3,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  }
];

export const fondos: Investment[] = [
  // Student 1 (María García - Programación)
  {
    id: 1,
    student_id: 1,
    fecha: new Date("2025-04-13"),
    monto: 100000,
    concepto: "Apertura de cuenta",
    created_at: "2025-04-13T00:00:00Z",
    updated_at: "2025-04-13T00:00:00Z"
  },
  {
    id: 2,
    student_id: 1,
    fecha: new Date("2025-05-07"),
    monto: 630000,
    concepto: "Parcialito 1",
    created_at: "2025-05-07T00:00:00Z",
    updated_at: "2025-05-07T00:00:00Z"
  },
  {
    id: 3,
    student_id: 1,
    fecha: new Date("2025-05-15"),
    monto: 100000,
    concepto: "TP entrega 1",
    created_at: "2025-05-15T00:00:00Z",
    updated_at: "2025-05-15T00:00:00Z"
  },
  {
    id: 4,
    student_id: 1,
    fecha: new Date("2025-05-28"),
    monto: 850000,
    concepto: "Parcial Teorico 1",
    created_at: "2025-05-28T00:00:00Z",
    updated_at: "2025-05-28T00:00:00Z"
  },
  {
    id: 5,
    student_id: 1,
    fecha: new Date("2025-06-01"),
    monto: 100000,
    concepto: "TP entrega 2",
    created_at: "2025-06-01T00:00:00Z",
    updated_at: "2025-06-01T00:00:00Z"
  },
  {
    id: 6,
    student_id: 1,
    fecha: new Date("2025-06-05"),
    monto: 750000,
    concepto: "Parcial Práctico 1",
    created_at: "2025-06-05T00:00:00Z",
    updated_at: "2025-06-05T00:00:00Z"
  },
  {
    id: 7,
    student_id: 1,
    fecha: new Date("2025-06-25"),
    monto: 650000,
    concepto: "Parcial Práctico 2",
    created_at: "2025-06-25T00:00:00Z",
    updated_at: "2025-06-25T00:00:00Z"
  },

  // Student 2 (Carlos López - Programación)
  {
    id: 8,
    student_id: 2,
    fecha: new Date("2025-04-15"),
    monto: 200000,
    concepto: "Apertura de cuenta",
    created_at: "2025-04-15T00:00:00Z",
    updated_at: "2025-04-15T00:00:00Z"
  },
  {
    id: 9,
    student_id: 2,
    fecha: new Date("2025-05-10"),
    monto: 450000,
    concepto: "Primer parcial",
    created_at: "2025-05-10T00:00:00Z",
    updated_at: "2025-05-10T00:00:00Z"
  },
  {
    id: 10,
    student_id: 2,
    fecha: new Date("2025-05-20"),
    monto: 300000,
    concepto: "Trabajo práctico",
    created_at: "2025-05-20T00:00:00Z",
    updated_at: "2025-05-20T00:00:00Z"
  },
  {
    id: 11,
    student_id: 2,
    fecha: new Date("2025-06-10"),
    monto: 500000,
    concepto: "Segundo parcial",
    created_at: "2025-06-10T00:00:00Z",
    updated_at: "2025-06-10T00:00:00Z"
  },

  // Student 3 (Ana Rodríguez - Programación)
  {
    id: 12,
    student_id: 3,
    fecha: new Date("2025-04-20"),
    monto: 150000,
    concepto: "Apertura de cuenta",
    created_at: "2025-04-20T00:00:00Z",
    updated_at: "2025-04-20T00:00:00Z"
  },
  {
    id: 13,
    student_id: 3,
    fecha: new Date("2025-05-12"),
    monto: 350000,
    concepto: "Evaluación inicial",
    created_at: "2025-05-12T00:00:00Z",
    updated_at: "2025-05-12T00:00:00Z"
  },
  {
    id: 14,
    student_id: 3,
    fecha: new Date("2025-06-02"),
    monto: 400000,
    concepto: "Proyecto final",
    created_at: "2025-06-02T00:00:00Z",
    updated_at: "2025-06-02T00:00:00Z"
  },

  // Student 4 (Pedro Silva - Finanzas)
  {
    id: 15,
    student_id: 4,
    fecha: new Date("2025-04-10"),
    monto: 250000,
    concepto: "Apertura de cuenta",
    created_at: "2025-04-10T00:00:00Z",
    updated_at: "2025-04-10T00:00:00Z"
  },
  {
    id: 16,
    student_id: 4,
    fecha: new Date("2025-05-05"),
    monto: 550000,
    concepto: "Análisis financiero",
    created_at: "2025-05-05T00:00:00Z",
    updated_at: "2025-05-05T00:00:00Z"
  },
  {
    id: 17,
    student_id: 4,
    fecha: new Date("2025-05-25"),
    monto: 400000,
    concepto: "Caso de estudio",
    created_at: "2025-05-25T00:00:00Z",
    updated_at: "2025-05-25T00:00:00Z"
  },
  {
    id: 18,
    student_id: 4,
    fecha: new Date("2025-06-15"),
    monto: 700000,
    concepto: "Examen final",
    created_at: "2025-06-15T00:00:00Z",
    updated_at: "2025-06-15T00:00:00Z"
  },

  // Student 5 (Laura Martínez - Finanzas)
  {
    id: 19,
    student_id: 5,
    fecha: new Date("2025-04-12"),
    monto: 180000,
    concepto: "Apertura de cuenta",
    created_at: "2025-04-12T00:00:00Z",
    updated_at: "2025-04-12T00:00:00Z"
  },
  {
    id: 20,
    student_id: 5,
    fecha: new Date("2025-05-08"),
    monto: 420000,
    concepto: "Primer módulo",
    created_at: "2025-05-08T00:00:00Z",
    updated_at: "2025-05-08T00:00:00Z"
  },
  {
    id: 21,
    student_id: 5,
    fecha: new Date("2025-06-08"),
    monto: 320000,
    concepto: "Segundo módulo",
    created_at: "2025-06-08T00:00:00Z",
    updated_at: "2025-06-08T00:00:00Z"
  },

  // Student 6 (Diego Fernández - Matemáticas)
  {
    id: 22,
    student_id: 6,
    fecha: new Date("2025-04-05"),
    monto: 300000,
    concepto: "Apertura de cuenta",
    created_at: "2025-04-05T00:00:00Z",
    updated_at: "2025-04-05T00:00:00Z"
  },
  {
    id: 23,
    student_id: 6,
    fecha: new Date("2025-04-25"),
    monto: 800000,
    concepto: "Álgebra lineal",
    created_at: "2025-04-25T00:00:00Z",
    updated_at: "2025-04-25T00:00:00Z"
  },
  {
    id: 24,
    student_id: 6,
    fecha: new Date("2025-05-15"),
    monto: 600000,
    concepto: "Cálculo diferencial",
    created_at: "2025-05-15T00:00:00Z",
    updated_at: "2025-05-15T00:00:00Z"
  },
  {
    id: 25,
    student_id: 6,
    fecha: new Date("2025-06-05"),
    monto: 900000,
    concepto: "Proyecto de investigación",
    created_at: "2025-06-05T00:00:00Z",
    updated_at: "2025-06-05T00:00:00Z"
  },
  {
    id: 26,
    student_id: 6,
    fecha: new Date("2025-06-25"),
    monto: 750000,
    concepto: "Examen comprensivo",
    created_at: "2025-06-25T00:00:00Z",
    updated_at: "2025-06-25T00:00:00Z"
  }
];