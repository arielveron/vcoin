import React from "react";
import { formatearMoneda } from "@/utils/format";
import { ClassSettings } from "@/db/pseudo-db";
import { calculateDiasRestantes } from "@/logic/calculations";

interface EstimadoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  montoEstimado: number;
  classSettings: ClassSettings;
}

export default function Estimado({ montoEstimado, classSettings, className, ...props }: EstimadoProps) {
  const diasRestantes = calculateDiasRestantes(classSettings);
  
  return (
    <div
      className={`flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md ${className}`}
      {...props}
    >
      <div className="text-gray-700">{formatearMoneda(montoEstimado)}</div>
      <div className="text-gray-700 text-xs text-center">
        Estimado al finalizar <br /> dentro de {diasRestantes} días
      </div>
    </div>
  );
}
