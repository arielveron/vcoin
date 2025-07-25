// Database entity types

export interface ClassSettings {
  end_date: Date; // Date object for consistency throughout the application
  timezone: string; // IANA timezone identifier (e.g., 'America/Argentina/Buenos_Aires')
  current_monthly_interest_rate?: number; // Current rate from history
}

export interface InterestRateHistory {
  id: number;
  class_id: number;
  monthly_interest_rate: number;
  effective_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CurrentInterestRate {
  class_id: number;
  monthly_interest_rate: number;
  effective_date: Date;
  created_at: Date;
}

export interface InterestRateChange {
  id: number;
  class_id: number;
  class_name: string;
  monthly_interest_rate: number;
  effective_date: Date;
  previous_rate: number | null;
  rate_direction: 'initial' | 'up' | 'down' | 'same';
  created_at: Date;
  updated_at: Date;
}

// Investment Category types
export interface InvestmentCategory {
  id: number;
  name: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  text_style: {
    fontSize?: string;      // Tailwind classes: 'text-sm', 'text-lg', etc
    fontWeight?: string;    // 'font-normal', 'font-semibold', 'font-bold'
    fontStyle?: string;     // 'italic', 'not-italic'
    textColor?: string;     // 'text-red-600' or hex '#FF0000'
    effectClass?: string;   // Premium CSS class name
    customCSS?: string;     // Add this - for inline styles
  };
  icon_config?: {
    name: string;           // Icon component name
    library: 'lucide' | 'heroicons' | 'tabler' | 'phosphor' | 'iconoir';
    size?: number;          // Size in pixels
    animationClass?: string; // 'animate-spin', 'animate-pulse', etc
    color?: string;         // Icon color
  } | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateInvestmentCategoryRequest {
  name: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  text_style?: InvestmentCategory['text_style'];
  icon_config?: InvestmentCategory['icon_config'];
  is_active?: boolean;
  sort_order?: number;
}

export interface Class {
  id: number;
  name: string;
  description?: string;
  end_date: Date; // PostgreSQL DATE field returns as Date object
  timezone: string;
  current_monthly_interest_rate?: number; // Current rate from history
  created_at: Date;
  updated_at: Date;
}

export interface Student {
  id: number;
  registro: number; // Student registry number for reference
  name: string;
  email: string;
  class_id: number;
  password_hash?: string; // Optional password hash for student authentication
  created_at: Date;
  updated_at: Date;
}

export interface Investment {
  id: number;
  student_id: number;
  fecha: Date; // PostgreSQL DATE field returns as Date object
  monto: number; // PostgreSQL INTEGER field returns as number
  concepto: string;
  category_id?: number; // Reference to investment category
  created_at: Date;
  updated_at: Date;
}

// DTOs for API responses
export interface InvestmentWithStudent extends Investment {
  student_name: string;
  student_email: string;
  class_name: string;
  category?: InvestmentCategory | null;
}

// Update Investment interface to include category
export interface InvestmentWithCategory extends Investment {
  category?: InvestmentCategory | null;
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
}

export interface CreateStudentRequest {
  registro: number;
  name: string;
  email: string;
  class_id: number;
  password?: string; // Optional password for initial creation
}

export interface CreateInvestmentRequest {
  student_id: number;
  fecha: Date; // Date object for consistency
  monto: number;
  concepto: string;
  category_id?: number; // Optional reference to investment category
}

// Interest Rate History interfaces
export interface InterestRateHistory {
  id: number;
  class_id: number;
  monthly_interest_rate: number;
  effective_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface InterestRateChange extends InterestRateHistory {
  class_name: string;
  previous_rate: number | null;
  rate_direction: 'initial' | 'up' | 'down' | 'same';
}

export interface CreateInterestRateRequest {
  class_id: number;
  monthly_interest_rate: number;
  effective_date: Date;
}

// Student Authentication types
export interface StudentLoginRequest {
  class_id: number;
  registro: number;
  password: string;
}

export interface StudentSession {
  student_id: number;
  registro: number;
  name: string;
  email: string;
  class_id: number;
  class_name: string;
}

export interface StudentPasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface StudentProfileUpdateRequest {
  email?: string;
  password?: string;
  current_password?: string;
}
