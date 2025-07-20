import { differenceInDays, differenceInSeconds } from "date-fns";
import { ClassSettings } from "@/db/pseudo-db";

interface InvestmentItem {
  id: number;
  fecha: Date; // Changed to Date to match database type
  monto: number;
  concepto: string;
}

// Helper functions to calculate interest rates on the fly
export const calculateDailyInterestRate = (monthlyRate: number): number => {
  // Convert monthly rate to daily: (1 + monthlyRate)^(1/30) - 1
  return Math.pow(1 + monthlyRate, 1 / 30) - 1;
};

export const calculateSecondsInterestRate = (monthlyRate: number): number => {
  // Convert monthly rate to seconds: (1 + monthlyRate)^(1/(30*24*3600)) - 1
  const secondsPerMonth = 30 * 24 * 3600; // 2,592,000 seconds in 30 days
  return Math.pow(1 + monthlyRate, 1 / secondsPerMonth) - 1;
};

// Server-side calculations that work with passed data and class settings
export const calculateMontoActual = (investments: InvestmentItem[], settings: ClassSettings): number => {
  // Check if we've reached the end date
  if (hasReachedEndDate(settings)) {
    // If we've reached the end date, calculate using the end date (finalization)
    return calculateMontoAFinalizacion(investments, settings);
  }
  // Otherwise, calculate using current time
  return calculateMontoAFechaSegundos(new Date(), investments, settings);
};

export const calculateMontoAFinalizacion = (investments: InvestmentItem[], settings: ClassSettings): number => {
  // Use the Date object directly, don't create a new Date from it
  const finalizacionDate = new Date(settings.end_date.getTime());
  finalizacionDate.setHours(23, 59, 59, 999);
  return calculateMontoAFecha(finalizacionDate, investments, settings);
};

export const calculateMontoAFecha = (fecha: Date, investments: InvestmentItem[], settings: ClassSettings): number => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  const dailyRate = calculateDailyInterestRate(settings.monthly_interest_rate);
  
  let totalGanancia = 0;
  for (const item of investments) {
    const diasTranscurridos = differenceInDays(fecha, item.fecha) + 1; // item.fecha is already a Date
    if (diasTranscurridos <= 0) continue; // Skip future investments
    
    const ganancia = item.monto * Math.pow(1 + dailyRate, diasTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const calculateMontoAFechaSegundos = (fecha: Date, investments: InvestmentItem[], settings: ClassSettings): number => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  const secondsRate = calculateSecondsInterestRate(settings.monthly_interest_rate);
  
  let totalGanancia = 0;
  for (const item of investments) {
    const segundosTranscurridos = differenceInSeconds(fecha, item.fecha); // item.fecha is already a Date
    if (segundosTranscurridos <= 0) continue; // Skip future investments
    
    const ganancia = item.monto * Math.pow(1 + secondsRate, segundosTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const calculateGananciaTotal = (investments: InvestmentItem[], settings: ClassSettings): number => {
  const totalInvertido = investments.reduce((acc, item) => acc + item.monto, 0);
  if (totalInvertido === 0) return 0;
  
  const montoActual = calculateMontoActual(investments, settings);
  const ganancia = montoActual - totalInvertido;
  return (ganancia / totalInvertido) * 100;
};

export const calculateDiasRestantes = (settings: ClassSettings): number => {
  const today = new Date();
  const endDateObj = new Date(settings.end_date.getTime());
  endDateObj.setHours(23, 59, 59, 999);
  
  // Handle timezone conversion for Argentina (GMT-3)
  if (settings.timezone && settings.timezone.includes('Argentina')) {
    endDateObj.setTime(endDateObj.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours
  }
  // Handle timezone conversion for Sao Paulo (GMT-2)
  else if (settings.timezone && settings.timezone.includes('Sao_Paulo')) {
    endDateObj.setTime(endDateObj.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
  }
  
  const dias = differenceInDays(endDateObj, today);
  return Math.max(0, dias);
};

export const hasReachedEndDate = (settings: ClassSettings): boolean => {
  const now = new Date();
  const endDate = new Date(settings.end_date.getTime());
  endDate.setHours(23, 59, 59, 999);
  
  // Handle timezone conversion for Argentina (GMT-3)
  if (settings.timezone && settings.timezone.includes('Argentina')) {
    endDate.setTime(endDate.getTime() + (3 * 60 * 60 * 1000)); // Add 3 hours
  }
  // Handle timezone conversion for Sao Paulo (GMT-2)
  else if (settings.timezone && settings.timezone.includes('Sao_Paulo')) {
    endDate.setTime(endDate.getTime() + (2 * 60 * 60 * 1000)); // Add 2 hours
  }
  
  return now >= endDate;
};
