import { differenceInDays, differenceInSeconds } from "date-fns";
import { ClassSettings } from "@/types/database";

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

// ========================================
// HISTORICAL RATE CALCULATION METHODS
// ========================================
// These methods work with the service layer to get historical rates
// and apply different rates over time periods

/**
 * Calculate monto actual using historical interest rates
 * This function applies the correct interest rate based on when each investment was made
 * @param investments - Array of investment items
 * @param classId - Class ID for rate lookup
 * @param settings - Class settings for end date and timezone
 * @param getRateForDate - Function to get rate for a specific date (provided by service)
 */
export const calculateMontoActualWithHistory = async (
  investments: InvestmentItem[], 
  classId: number, 
  settings: ClassSettings,
  getRateForDate: (classId: number, date: Date) => Promise<number>
): Promise<number> => {
  // Check if we've reached the end date
  if (hasReachedEndDate(settings)) {
    // If we've reached the end date, calculate using the end date (finalization)
    return calculateMontoAFinalizacionWithHistory(investments, classId, settings, getRateForDate);
  }
  // Otherwise, calculate using current time
  return calculateMontoAFechaSegundosWithHistory(new Date(), investments, classId, getRateForDate);
};

/**
 * Calculate monto at finalization date using historical rates
 */
export const calculateMontoAFinalizacionWithHistory = async (
  investments: InvestmentItem[], 
  classId: number, 
  settings: ClassSettings,
  getRateForDate: (classId: number, date: Date) => Promise<number>
): Promise<number> => {
  const finalizacionDate = new Date(settings.end_date.getTime());
  finalizacionDate.setHours(23, 59, 59, 999);
  return calculateMontoAFechaWithHistory(finalizacionDate, investments, classId, getRateForDate, undefined);
};

/**
 * Calculate monto at a specific date using historical rates
 * This applies different rates over different time periods based on rate changes
 */
export const calculateMontoAFechaWithHistory = async (
  fecha: Date, 
  investments: InvestmentItem[], 
  classId: number,
  getRateForDate: (classId: number, date: Date) => Promise<number>,
  rateHistory?: any[] // Pass rate history to avoid repeated calls
): Promise<number> => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  let totalGanancia = 0;
  
  for (const item of investments) {
    // Skip future investments
    if (item.fecha > fecha) continue;
    
    // More efficient calculation by applying rates in chunks between rate change dates
    let currentAmount = item.monto;
    let periodStart = new Date(item.fecha);
    
    // Get all rate change dates between investment date and target date
    // If rateHistory is provided, use it; otherwise get rates day by day
    if (rateHistory && rateHistory.length > 0) {
      // Sort rate changes by date
      const relevantRates = rateHistory
        .filter(rate => new Date(rate.effective_date) >= periodStart && new Date(rate.effective_date) <= fecha)
        .sort((a, b) => new Date(a.effective_date).getTime() - new Date(b.effective_date).getTime());
      
      let currentDate = new Date(periodStart);
      
      for (let i = 0; i <= relevantRates.length; i++) {
        let periodEnd: Date;
        let currentRate: number;
        
        if (i < relevantRates.length) {
          periodEnd = new Date(relevantRates[i].effective_date);
          // Use the rate that was effective before this change
          currentRate = i === 0 ? 
            await getRateForDate(classId, currentDate) : 
            relevantRates[i - 1].monthly_interest_rate;
        } else {
          // Last period until target date
          periodEnd = new Date(fecha);
          currentRate = relevantRates.length > 0 ? 
            relevantRates[relevantRates.length - 1].monthly_interest_rate :
            await getRateForDate(classId, currentDate);
        }
        
        // Calculate days in this period
        const daysInPeriod = Math.max(0, Math.ceil((periodEnd.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        if (daysInPeriod > 0) {
          const dailyRate = calculateDailyInterestRate(currentRate);
          currentAmount = currentAmount * Math.pow(1 + dailyRate, daysInPeriod);
        }
        
        currentDate = new Date(periodEnd);
      }
    } else {
      // Fallback to day-by-day calculation
      let currentDate = new Date(periodStart);
      
      while (currentDate < fecha) {
        const nextDay = new Date(currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        // Don't go beyond our target date
        const endDate = nextDay > fecha ? fecha : nextDay;
        
        // Get the rate that was effective on this specific date
        const effectiveRate = await getRateForDate(classId, currentDate);
        const dailyRate = calculateDailyInterestRate(effectiveRate);
        
        // Calculate the fraction of day if endDate is not a full day
        const hours = (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
        const dayFraction = hours / 24;
        
        // Apply compound interest for this period
        if (dayFraction > 0) {
          currentAmount = currentAmount * Math.pow(1 + dailyRate, dayFraction);
        }
        
        currentDate = endDate;
      }
    }
    
    totalGanancia += currentAmount;
  }
  
  return totalGanancia;
};

/**
 * Calculate monto at a specific date using seconds precision and historical rates
 */
export const calculateMontoAFechaSegundosWithHistory = async (
  fecha: Date, 
  investments: InvestmentItem[], 
  classId: number,
  getRateForDate: (classId: number, date: Date) => Promise<number>
): Promise<number> => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  let totalGanancia = 0;
  
  for (const item of investments) {
    // Skip future investments
    if (item.fecha > fecha) continue;
    
    // For seconds precision, we'll use the rate that was effective when the investment was made
    const effectiveRate = await getRateForDate(classId, item.fecha);
    const secondsRate = calculateSecondsInterestRate(effectiveRate);
    
    const segundosTranscurridos = differenceInSeconds(fecha, item.fecha);
    if (segundosTranscurridos <= 0) continue;
    
    const ganancia = item.monto * Math.pow(1 + secondsRate, segundosTranscurridos);
    totalGanancia += ganancia;
  }
  
  return totalGanancia;
};

/**
 * Calculate total gain using historical rates
 */
export const calculateGananciaTotalWithHistory = async (
  investments: InvestmentItem[], 
  classId: number, 
  settings: ClassSettings,
  getRateForDate: (classId: number, date: Date) => Promise<number>
): Promise<number> => {
  const totalInvertido = investments.reduce((acc, item) => acc + item.monto, 0);
  if (totalInvertido === 0) return 0;
  
  const montoActual = await calculateMontoActualWithHistory(investments, classId, settings, getRateForDate);
  const ganancia = montoActual - totalInvertido;
  return (ganancia / totalInvertido) * 100;
};
