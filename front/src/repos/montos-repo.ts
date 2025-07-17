import { fondos } from "@/db/pseudo-db";

export const getMontoInvertido = () => {
  return fondos.reduce((acc, fondo) => {
    acc = acc + fondo.monto;
    return acc;
  }, 0);
};

export const getListInvertidos = () => {
  return fondos.map((fondo) => ({
    id: fondo.id,
    fecha: fondo.fecha,
    monto: fondo.monto,
    concepto: fondo.concepto,
  }));
}
