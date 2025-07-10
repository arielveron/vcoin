import React from "react";
import Image from "next/image";
import { monthlyInterestRate } from "@/config/settings";
import { formatearMoneda } from "@/utils/format";

export default function Interes() {
  return (
    <div className="flex flex-col gap-2 items-center justify-center p-4 bg-gray-200 rounded-lg w-full max-w-md">
      <div className="text-gray-700 flex flex-row items-center justify-center gap-2">
        {formatearMoneda(monthlyInterestRate * 100)}%{" "}
        <Image src="/vcoin-xs.gif" alt="Vcoin Logo" width={15} height={16} className="col-span-2 mx-auto" />
      </div>
      <div className="text-gray-700 text-xs">Interés mensual</div>
    </div>
  );
}
