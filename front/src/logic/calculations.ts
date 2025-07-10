import { diasInterestRate, endDate, monthlyInterestRate, segundosInterestRate } from "@/config/settings";
import { getListInvertidos, getMontoInvertido } from "@/repos/montos-repo";
import { differenceInDays, differenceInSeconds, parseISO } from "date-fns";

export const getMontoActual = (): number => {
  return getMontoAFechaSegundos(new Date());
};

export const getMontoAFinalizacion = (): number => {
  const finalizacionDate = new Date(endDate);
  return getMontoAFecha(finalizacionDate);
};

export const getMontoAFecha = (fecha: Date): number => {
  const listInvertidos = getListInvertidos(); // Ensure the list is fetched, if needed
  if (!listInvertidos || listInvertidos.length === 0) {
    return 0; // No investments found
  }

  let totalGanancia = 0;
  for (const item of listInvertidos) {
    const diasTranscurridos = differenceInDays(fecha, parseISO(item.fecha));
    const ganancia = item.monto * Math.pow(1 + diasInterestRate, diasTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

export const getMontoAFechaSegundos = (fecha: Date): number => {
  const listInvertidos = getListInvertidos(); // Ensure the list is fetched, if
  if (!listInvertidos || listInvertidos.length === 0) {
    return 0; // No investments found
  }
  let totalGanancia = 0;
  for (const item of listInvertidos) {
    const segundosTranscurridos = differenceInSeconds(fecha, parseISO(item.fecha));
    const ganancia = item.monto * Math.pow(1 + segundosInterestRate, segundosTranscurridos);
    totalGanancia += ganancia;
  }
  return totalGanancia;
};

// const pasajeDeTasasDiariasASegundos = (tasaDiaria: number): number => {
//   const SEGUNDOS_POR_DIA = 86400; // 24 horas
//   return Math.pow(1 + tasaDiaria, 1 / SEGUNDOS_POR_DIA) - 1;
// };



export const getGananciaTotal = (): number => {
  const montoActual = getMontoActual();
  const montoInvertido = getMontoInvertido();
  return montoActual / montoInvertido - 1;
}

export const getDiasRestantes = (): number => {
  const today = new Date();
  const endDateObj = new Date(endDate);
  return differenceInDays(endDateObj, today);
}
