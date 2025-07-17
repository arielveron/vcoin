import { formatearMoneda } from "@/utils/format";
import Image from "next/image";
import React from "react";

interface GananciaProps {
  gananciaTotal: number;
}

export default function Ganancia({ gananciaTotal }: GananciaProps) {
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md">
      <div className="text-gray-700 flex flex-row items-center justify-center gap-2">
        {formatearMoneda(gananciaTotal, 2)}%
        <Image src="/vcoin-xs.gif" alt="Vcoin Logo" width={15} height={16} className="col-span-2 mx-auto" />
      </div>
      <div className="text-gray-700 text-xs">Ganancia total</div>
    </div>
  );
}
