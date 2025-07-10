import React from "react";
import { getDiasRestantes, getMontoAFinalizacion } from "@/logic/calculations";
import { formatearMoneda } from "@/utils/format";

export default function Estimado(props: React.HTMLAttributes<HTMLDivElement> & { className?: string }) {
  return (
    <div
      className={`flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md ${props.className}`}
    >
      <div className="text-gray-700">$ {formatearMoneda(getMontoAFinalizacion())}</div>
      <div className="text-gray-700 text-xs text-center">
        Estimado al finalizar <br /> dentro de {getDiasRestantes()} días
      </div>
    </div>
  );
}
