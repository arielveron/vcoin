/**
 * Investment calculations domain logic
 * Core business logic for investment calculations
 * Migrated from /logic/calculations.ts
 */

import { differenceInDays, differenceInSeconds } from "date-fns";
import type { ClassEntity, InvestmentEntity } from './types';

// Legacy aliases for backward compatibility
export type ClassSettings = ClassEntity;
export type InvestmentItem = InvestmentEntity;

/**
 * Calculate daily interest rate from monthly rate
 */
export const calculateDailyInterestRate = (monthlyRate: number): number => {
  // Convert monthly rate to daily: (1 + monthlyRate)^(1/30) - 1
  return Math.pow(1 + monthlyRate, 1 / 30) - 1;
};

/**
 * Calculate seconds interest rate from monthly rate
 */
export const calculateSecondsInterestRate = (monthlyRate: number): number => {
  // Convert monthly rate to seconds: (1 + monthlyRate)^(1/(30*24*3600)) - 1
  const secondsPerMonth = 30 * 24 * 3600; // 2,592,000 seconds in 30 days
  return Math.pow(1 + monthlyRate, 1 / secondsPerMonth) - 1;
};

/**
 * Check if the class has reached its end date
 */
export const hasReachedEndDate = (settings: ClassEntity): boolean => {
  const now = new Date();
  const endDateObj = new Date(settings.end_date.getTime());
  endDateObj.setHours(23, 59, 59, 999);
  return now >= endDateObj;
};

/**
 * Calculate current amount considering class end date
 */
export const calculateMontoActual = (investments: InvestmentEntity[], settings: ClassEntity): number => {
  // Check if we've reached the end date
  if (hasReachedEndDate(settings)) {
    // If we've reached the end date, calculate using the end date (finalization)
    return calculateMontoAFinalizacion(investments, settings);
  }
  // Otherwise, calculate using current time
  return calculateMontoAFechaSegundos(new Date(), investments, settings);
};

/**
 * Calculate amount at class finalization date
 */
export const calculateMontoAFinalizacion = (investments: InvestmentEntity[], settings: ClassEntity): number => {
  // Use the Date object directly, don't create a new Date from it
  const finalizacionDate = new Date(settings.end_date.getTime());
  finalizacionDate.setHours(23, 59, 59, 999);
  return calculateMontoAFechaSegundos(finalizacionDate, investments, settings);
};

/**
 * Calculate amount at specific date using daily interest
 */
export const calculateMontoAFecha = (fecha: Date, investments: InvestmentEntity[], settings: ClassEntity): number => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  // Use current_monthly_interest_rate if available, otherwise fallback
  const monthlyRate = settings.current_monthly_interest_rate || 0.01;
  const dailyRate = calculateDailyInterestRate(monthlyRate);
  
  let totalGanancia = 0;
  for (const item of investments) {
    const diasTranscurridos = differenceInDays(fecha, item.fecha) + 1; // item.fecha is already a Date
    if (diasTranscurridos <= 0) continue; // Skip future investments
    
    const ganancia = item.monto * Math.pow(1 + dailyRate, diasTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

/**
 * Calculate amount at specific date using seconds precision
 */
export const calculateMontoAFechaSegundos = (fecha: Date, investments: InvestmentEntity[], settings: ClassEntity): number => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  // Use current_monthly_interest_rate if available, otherwise fallback
  const monthlyRate = settings.current_monthly_interest_rate || 0.01;
  const secondsRate = calculateSecondsInterestRate(monthlyRate);
  
  let totalGanancia = 0;
  for (const item of investments) {
    const segundosTranscurridos = differenceInSeconds(fecha, item.fecha); // item.fecha is already a Date
    if (segundosTranscurridos <= 0) continue; // Skip future investments
    
    const ganancia = item.monto * Math.pow(1 + secondsRate, segundosTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

/**
 * Calculate total gain percentage
 */
export const calculateGananciaTotal = (investments: InvestmentEntity[], settings: ClassEntity): number => {
  const totalInvertido = investments.reduce((acc, item) => acc + item.monto, 0);
  if (totalInvertido === 0) return 0;
  
  const montoActual = calculateMontoActual(investments, settings);
  const ganancia = montoActual - totalInvertido;
  return (ganancia / totalInvertido) * 100;
};

/**
 * Calculate remaining days until class end
 */
export const calculateDiasRestantes = (settings: ClassEntity): number => {
  const today = new Date();
  const endDateObj = new Date(settings.end_date.getTime());
  endDateObj.setHours(23, 59, 59, 999);
  
  // The end_date from the database is already in the class's local timezone
  // We don't need to adjust it further since we're comparing with local server time
  
  const dias = differenceInDays(endDateObj, today);
  return Math.max(0, dias);
};
