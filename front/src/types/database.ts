// Database entity types

export interface ClassSettings {
  end_date: Date; // Date object for consistency throughout the application
  timezone: string; // IANA timezone identifier (e.g., 'America/Argentina/Buenos_Aires')
  monthly_interest_rate: number;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  end_date: Date; // PostgreSQL DATE field returns as Date object
  timezone: string;
  monthly_interest_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface Student {
  id: number;
  registro: number; // Student registry number for reference
  name: string;
  email: string;
  class_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Investment {
  id: number;
  student_id: number;
  fecha: Date; // PostgreSQL DATE field returns as Date object
  monto: number; // PostgreSQL INTEGER field returns as number
  concepto: string;
  created_at: Date;
  updated_at: Date;
}

// DTOs for API responses
export interface InvestmentWithStudent extends Investment {
  student_name: string;
  student_email: string;
  class_name: string;
}

export interface StudentWithInvestments extends Student {
  investments: Investment[];
  total_invested: number;
}

// Request types
export interface CreateClassRequest {
  name: string;
  description?: string;
  end_date: Date;
  timezone: string;
  monthly_interest_rate: number;
}

export interface CreateStudentRequest {
  registro: number;
  name: string;
  email: string;
  class_id: number;
}

export interface CreateInvestmentRequest {
  student_id: number;
  fecha: Date; // Date object for consistency
  monto: number;
  concepto: string;
}
