/**
 * Investment domain types
 * Core types and interfaces for investment business logic
 */

export interface InvestmentEntity {
  id: number;
  fecha: Date;
  monto: number;
  concepto: string;
  student_id: number;
  category_id?: number;
}

export interface ClassEntity {
  id: number;
  name: string;
  end_date: Date;
  current_monthly_interest_rate: number;
  created_at: Date;
}

export interface InvestmentStats {
  totalInvested: number;
  currentAmount: number;
  totalGain: number;
  gainPercentage: number;
  daysRemaining: number;
}

export interface InvestmentCalculationParams {
  investments: InvestmentEntity[];
  classSettings: ClassEntity;
  calculateAt?: Date;
}

export interface InvestmentSummary {
  investment: InvestmentEntity;
  currentValue: number;
  gainAmount: number;
  gainPercentage: number;
  daysHeld: number;
}
