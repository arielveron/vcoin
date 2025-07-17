'use server';

import { ServerDataService } from '@/services/server-data-service';
import { calculateMontoActual } from '@/logic/calculations-server';

export async function getCurrentMonto(): Promise<number> {
  const investments = await ServerDataService.getInvestmentsList();
  return calculateMontoActual(investments);
}

export async function getInvestmentData() {
  const totalInvertido = await ServerDataService.getTotalInvested();
  const investments = await ServerDataService.getInvestmentsList();
  const montoActual = calculateMontoActual(investments);
  
  return {
    totalInvertido,
    montoActual,
    timestamp: Date.now()
  };
}
