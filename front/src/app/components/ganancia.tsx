import { getGananciaTotal } from "@/logic/calculations";
import { formatearMoneda } from "@/utils/format";
import React from "react";

export default function Ganancia() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md">
      <div className="text-gray-700">{formatearMoneda(getGananciaTotal(), 2)}%</div>
      <div className="text-gray-700 text-xs">Ganancia total</div>
    </div>
  );
}
