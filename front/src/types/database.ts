// Database entity types

export interface Class {
  id: number;
  name: string;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  class_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface Investment {
  id: number;
  student_id: number;
  fecha: string; // Keep as string to match current format (YYYY-MM-DD)
  monto: number;
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
}

export interface CreateStudentRequest {
  name: string;
  email: string;
  class_id: number;
}

export interface CreateInvestmentRequest {
  student_id: number;
  fecha: string;
  monto: number;
  concepto: string;
}
