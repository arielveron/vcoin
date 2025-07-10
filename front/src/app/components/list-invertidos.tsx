import React from "react";
import { getListInvertidos, getMontoInvertido } from "@/repos/montos-repo";

export default function ListInvertidos(props: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  const list = getListInvertidos();
  if (!list || list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md">
        No hay fondos invertidos.
      </div>
    );
  }
  return (
    <div className={`grid grid-cols-2 gap-2 items-center justify-center w-full max-w-md px-5 text-xs ${props.className}`}>
      <div className="col-span-2 text-gray-700 font-bold text-center">Total Invertido: {getMontoInvertido().toLocaleString("es-AR")} USD</div>
      <hr className="col-span-2 border-gray-300" />
      <div className="text-gray-700 font-bold">Fecha</div>
      <div className="text-gray-700 font-bold justify-self-end">Monto</div>
      {list.map((item) => (
        <React.Fragment key={item.fecha}>
          <div className="text-gray-700">{item.fecha}</div>
          <div className="text-gray-700 justify-self-end">{item.monto.toLocaleString("es-AR")} USD</div>
        </React.Fragment>
      ))}
    </div>
  );
}
