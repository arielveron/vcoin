import { InvestmentRepository } from './investment-repo';
import { fondos } from '@/db/pseudo-db';

// Create repository instance
const investmentRepo = new InvestmentRepository();

// For now, we'll work with the first student (demo student)
// Later this can be modified to work with the current logged-in student
const CURRENT_STUDENT_ID = 1;

// Cache for synchronous access
let cachedTotal = 0;
let cachedList: Array<{
  id: number;
  fecha: string;
  monto: number;
  concepto: string;
}> = [];
let isInitialized = false;
let databaseAvailable = true;

// Initialize cache
const initializeCache = async () => {
  if (isInitialized) return;
  
  try {
    const investments = await investmentRepo.findByStudentId(CURRENT_STUDENT_ID);
    cachedList = investments.map((investment) => ({
      id: investment.id,
      fecha: investment.fecha,
      monto: investment.monto,
      concepto: investment.concepto,
    }));
    
    cachedTotal = await investmentRepo.getTotalByStudentId(CURRENT_STUDENT_ID);
    isInitialized = true;
    databaseAvailable = true;
    console.log('✅ Using database for investment data');
  } catch (error) {
    console.warn('⚠️ Database not available, falling back to pseudo-db:', (error as Error).message);
    databaseAvailable = false;
    // Fallback to pseudo-db if database is not available
    cachedList = fondos.map((fondo) => ({
      id: fondo.id,
      fecha: fondo.fecha,
      monto: fondo.monto,
      concepto: fondo.concepto,
    }));
    cachedTotal = fondos.reduce((acc, fondo) => acc + fondo.monto, 0);
    isInitialized = true;
  }
};

// Initialize immediately but don't block
initializeCache();

// Async versions (preferred for new code)
export const getMontoInvertidoAsync = async (): Promise<number> => {
  if (!databaseAvailable) {
    return fondos.reduce((acc, fondo) => acc + fondo.monto, 0);
  }
  
  try {
    return await investmentRepo.getTotalByStudentId(CURRENT_STUDENT_ID);
  } catch (error) {
    console.error('Error getting total invested amount:', error);
    return fondos.reduce((acc, fondo) => acc + fondo.monto, 0);
  }
};

export const getListInvertidosAsync = async () => {
  if (!databaseAvailable) {
    return fondos.map((fondo) => ({
      id: fondo.id,
      fecha: fondo.fecha,
      monto: fondo.monto,
      concepto: fondo.concepto,
    }));
  }
  
  try {
    const investments = await investmentRepo.findByStudentId(CURRENT_STUDENT_ID);
    return investments.map((investment) => ({
      id: investment.id,
      fecha: investment.fecha,
      monto: investment.monto,
      concepto: investment.concepto,
    }));
  } catch (error) {
    console.error('Error getting investments list:', error);
    return fondos.map((fondo) => ({
      id: fondo.id,
      fecha: fondo.fecha,
      monto: fondo.monto,
      concepto: fondo.concepto,
    }));
  }
};

// Synchronous versions for backward compatibility
export const getMontoInvertido = (): number => {
  if (!isInitialized) {
    // Return pseudo-db data immediately if not initialized
    return fondos.reduce((acc, fondo) => acc + fondo.monto, 0);
  }
  return cachedTotal;
};

export const getListInvertidos = () => {
  if (!isInitialized) {
    // Return pseudo-db data immediately if not initialized
    return fondos.map((fondo) => ({
      id: fondo.id,
      fecha: fondo.fecha,
      monto: fondo.monto,
      concepto: fondo.concepto,
    }));
  }
  return cachedList;
};
