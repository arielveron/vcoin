"use client";

import React, { useState } from "react";

interface InvestmentItem {
  id: number;
  fecha: string;
  monto: number;
  concepto: string;
}

interface ListInvertidosProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  totalInvertido: number;
  listInvertidos: InvestmentItem[];
}

export default function ListInvertidos({ totalInvertido, listInvertidos, className, ...props }: ListInvertidosProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  if (!listInvertidos || listInvertidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-lg w-full max-w-md">
        No hay fondos invertidos.
      </div>
    );
  }
  
  return (
    <div className={`w-full max-w-md px-5 text-xs ${className}`} {...props}>
      <div 
        className="flex items-center justify-between cursor-pointer p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="text-gray-700 font-bold text-center flex-1">
          Total Invertido: {totalInvertido.toLocaleString("es-AR")} $
        </div>
        <div className="ml-2 text-gray-500">
          {isCollapsed ? "►" : "▼"}
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_2fr] gap-2 items-center bg-gray-100 p-2">
            <div className="text-gray-700 font-bold">Fecha</div>
            <div className="text-gray-700 font-bold text-center">Monto</div>
            <div className="text-gray-700 font-bold">Concepto</div>
          </div>
          <hr className="border-gray-300" />
          {listInvertidos.map((item) => (
            <div key={item.fecha} className="grid grid-cols-[1fr_1fr_2fr] gap-2 items-start p-2 border-b border-gray-100 last:border-b-0">
              <div className="text-gray-700 text-nowrap">{item.fecha}</div>
              <div className="text-gray-700 text-right text-nowrap font-bold">{item.monto.toLocaleString("es-AR")} $</div>
              <div className="text-gray-700 text-xs leading-tight break-words">
                {item.concepto}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
