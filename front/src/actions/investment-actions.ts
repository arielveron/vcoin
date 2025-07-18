'use server';

import { ServerDataService } from '@/services/server-data-service';
import { calculateMontoActual } from '@/logic/calculations';

export async function getCurrentMonto(studentId: number = 1): Promise<number> {
  const investments = await ServerDataService.getInvestmentsList(studentId);
  const classSettings = await ServerDataService.getStudentClassSettings(studentId);
  return calculateMontoActual(investments, classSettings);
}

export async function getInvestmentData(studentId: number = 1) {
  const totalInvertido = await ServerDataService.getTotalInvested(studentId);
  const investments = await ServerDataService.getInvestmentsList(studentId);
  const classSettings = await ServerDataService.getStudentClassSettings(studentId);
  const montoActual = calculateMontoActual(investments, classSettings);
  
  return {
    totalInvertido,
    montoActual,
    classSettings,
    timestamp: Date.now()
  };
}
