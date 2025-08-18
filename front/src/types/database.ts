// Database entity types

export interface ClassSettings {
  end_date: Date; // Date object for consistency throughout the application
  start_date?: Date; // Optional start date for progress calculations
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
    library: 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor';
    size?: number;          // Size in pixels
    animationClass?: string; // 'animate-spin', 'animate-pulse', etc
    effectClass?: string;   // Premium CSS class name (same as text effects)
    color?: string;         // Icon foreground color
    backgroundColor?: string; // Icon background color
    padding?: number;       // Padding around icon when using background
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
  personalizacion?: 'A' | 'O' | null; // Personalization preference: A (feminine), O (masculine), null (not defined)
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
  personalizacion?: 'A' | 'O' | null;
}

export interface StudentPasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface StudentProfileUpdateRequest {
  email?: string;
  password?: string;
  current_password?: string;
  personalizacion?: 'A' | 'O' | null;
}

// Achievement types
export interface Achievement {
  id: number;
  name: string;
  name_a?: string | null; // Optional feminine variant name
  name_o?: string | null; // Optional masculine variant name
  description: string;
  category: 'academic' | 'consistency' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon_config: {
    name: string;
    library: 'lucide' | 'heroicons-solid' | 'heroicons-outline' | 'tabler' | 'phosphor';
    size?: number;
    color?: string;
    animationClass?: string;
  };
  trigger_type: 'automatic' | 'manual';
  trigger_config?: {
    metric: 'investment_count' | 'total_invested' | 'streak_days' | 'category_count';
    operator: '>' | '>=' | '=' | '<' | '<=';
    value: number;
    category_name?: string; // For category-specific achievements
    category_id?: number;
  } | null;
  celebration_config?: {
    animation?: 'confetti' | 'fireworks' | 'stars' | 'coins';
    duration?: number;
    sound?: boolean;
  };
  points: number;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Achievement type aliases for better reusability
export type AchievementCategory = Achievement['category'];
export type AchievementRarity = Achievement['rarity'];
export type AchievementTriggerType = Achievement['trigger_type'];
export type AchievementMetric = NonNullable<Achievement['trigger_config']>['metric'];
export type AchievementOperator = NonNullable<Achievement['trigger_config']>['operator'];
export type IconLibrary = Achievement['icon_config']['library'];

export interface StudentAchievement {
  student_id: number;
  achievement_id: number;
  unlocked_at: Date;
  seen: boolean;
  celebration_shown: boolean;
  metadata?: {
    triggerValue?: number; // The value that triggered the achievement
    context?: string; // Additional context
  };
}

export interface AchievementProgress {
  student_id: number;
  achievement_id: number;
  current_value: number;
  last_updated: Date;
}

export interface AchievementWithProgress extends Achievement {
  unlocked?: boolean;
  unlocked_at?: Date;
  progress?: number; // Percentage 0-100
  current_value?: number;
  required_value?: number;
}

export interface CreateAchievementRequest {
  name: string;
  name_a?: string; // Optional feminine variant name
  name_o?: string; // Optional masculine variant name
  description: string;
  category: Achievement['category'];
  rarity: Achievement['rarity'];
  icon_config: Achievement['icon_config'];
  trigger_type: Achievement['trigger_type'];
  trigger_config?: Achievement['trigger_config'];
  celebration_config?: Achievement['celebration_config'];
  points?: number;
  sort_order?: number;
  is_active?: boolean;
}

// Achievement notification for UI
export interface AchievementNotification {
  achievement: Achievement;
  unlocked_at: Date;
  isNew: boolean;
}

// Historical data types for graphs and components
export interface HistoricalAmount {
  date: Date;
  amount: number;
}

export interface InvestmentMarker {
  date: number; // Timestamp for graph rendering
  amount: number;
}

export interface RateChangeMarker {
  date: number; // Timestamp for graph rendering
  rate: number;
}

export interface HistoricalAmountsData {
  amounts: HistoricalAmount[];
  investmentMarkers: InvestmentMarker[];
  rateChangeMarkers: RateChangeMarker[];
}

// Graph data types for client components
export interface GraphDataPoint {
  date: string;
  amount: number;
  formattedAmount: string;
  sortKey: number;
}

export interface RateDataPoint {
  date: string;
  rate: number;
  formattedPercentage: string;
  sortKey: number;
}

// Batch investment types
export interface BatchInvestmentRow {
  student_id: number;
  student_name: string;
  student_registro: number;
  monto: number; // Amount in cents
}

export interface CreateBatchInvestmentRequest {
  fecha: Date;
  concepto: string;
  category_id?: number;
  investments: BatchInvestmentRow[];
}

export interface BatchInvestmentResult {
  success: boolean;
  created_count: number;
  failed_count: number;
  errors?: string[];
}
