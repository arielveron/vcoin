import { diasInterestRate, endDate, segundosInterestRate } from "@/config/settings";
import { differenceInDays, differenceInSeconds, parseISO } from "date-fns";

interface InvestmentItem {
  id: number;
  fecha: string;
  monto: number;
  concepto: string;
}

// Server-side calculations that work with passed data
export const calculateMontoActual = (investments: InvestmentItem[]): number => {
  return calculateMontoAFechaSegundos(new Date(), investments);
};

export const calculateMontoAFinalizacion = (investments: InvestmentItem[]): number => {
  const finalizacionDate = new Date(endDate);
  return calculateMontoAFecha(finalizacionDate, investments);
};

export const calculateMontoAFecha = (fecha: Date, investments: InvestmentItem[]): number => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }

  let totalGanancia = 0;
  for (const item of investments) {
    const diasTranscurridos = differenceInDays(fecha, parseISO(item.fecha)) + 1;
    const ganancia = item.monto * Math.pow(1 + diasInterestRate, diasTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const calculateMontoAFechaSegundos = (fecha: Date, investments: InvestmentItem[]): number => {
  if (!investments || investments.length === 0) {
    return 0; // No investments found
  }
  let totalGanancia = 0;
  for (const item of investments) {
    const segundosTranscurridos = differenceInSeconds(fecha, parseISO(item.fecha));
    const ganancia = item.monto * Math.pow(1 + segundosInterestRate, segundosTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const calculateGananciaTotal = (investments: InvestmentItem[]): number => {
  const totalInvertido = investments.reduce((acc, item) => acc + item.monto, 0);
  if (totalInvertido === 0) return 0;
  
  const montoActual = calculateMontoActual(investments);
  const ganancia = montoActual - totalInvertido;
  return (ganancia / totalInvertido) * 100;
};

// Client-side versions that use the pseudo-db fallback (for backward compatibility)
import { fondos } from "@/db/pseudo-db";

export const getMontoActual = (): number => {
  return getMontoAFechaSegundos(new Date());
};

export const getMontoAFinalizacion = (): number => {
  const finalizacionDate = new Date(endDate);
  return getMontoAFecha(finalizacionDate);
};

export const getMontoAFecha = (fecha: Date): number => {
  const listInvertidos = fondos;
  if (!listInvertidos || listInvertidos.length === 0) {
    return 0;
  }

  let totalGanancia = 0;
  for (const item of listInvertidos) {
    const diasTranscurridos = differenceInDays(fecha, parseISO(item.fecha)) + 1;
    const ganancia = item.monto * Math.pow(1 + diasInterestRate, diasTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const getMontoAFechaSegundos = (fecha: Date): number => {
  const listInvertidos = fondos;
  if (!listInvertidos || listInvertidos.length === 0) {
    return 0;
  }
  let totalGanancia = 0;
  for (const item of listInvertidos) {
    const segundosTranscurridos = differenceInSeconds(fecha, parseISO(item.fecha));
    const ganancia = item.monto * Math.pow(1 + segundosInterestRate, segundosTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const getGananciaTotal = (): number => {
  const totalInvertido = fondos.reduce((acc, item) => acc + item.monto, 0);
  if (totalInvertido === 0) return 0;
  
  const montoActual = getMontoActual();
  const ganancia = montoActual - totalInvertido;
  return (ganancia / totalInvertido) * 100;
};

export const getDiasRestantes = (): number => {
  const today = new Date();
  const endDateObj = new Date(endDate);
  const dias = differenceInDays(endDateObj, today);
  return Math.max(0, dias);
};
